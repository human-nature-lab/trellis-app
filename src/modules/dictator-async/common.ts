import { Connection, EntityManager, IsNull, QueryRunner } from 'typeorm'
import uuid from 'uuid/v4'
import PT from '@/static/parameter.types'
import DatabaseService from '@/services/database'
import QuestionDatum from '@/entities/trellis/QuestionDatum'
import Datum from '@/entities/trellis/Datum'
import Edge from '@/entities/trellis/Edge'
import Question from '@/entities/trellis/Question'
import { randomIntBits } from '@/classes/M'

export enum Message {
  Candidates = 'candidates',
  Hello = 'hello',
  StartPairs = 'start-pairs',
  CompleteTx = 'complete-tx',
  RollbackTx = 'rollback-tx',
}

export type Device = {
  deviceId: string
  deviceName: string
}

export type Decision = {
  respondentId: string
  questionId: string
  receiverQuestionId: string
  surveyId: string
  value: number
  max: number
}

export type DeviceDecision = Decision & { deviceId: string, isLocal?: boolean }
export type CandidatesResponse = Decision[]

export type CandidatesRequest = {
  formId: string
}

export type Pair = {
  decider: DeviceDecision
  receiver: DeviceDecision
}

export type PairRequest = {
  pairs: Pair[]
}
export type PairResponse = {}
export type CompleteTxRequest = {}
export type CompleteTxResponse = {}

export interface Actor {
  getDecisions (formId: string): Promise<Decision[]>
  startSave(pairs: Pair[]): Promise<void>
  completeSave(): Promise<void>
  rollbackSave(): Promise<void>
}

export class DBActor implements Actor {
  private txStarted = false
  private runner: QueryRunner

  async getDecisions (formId: string): Promise<Decision[]> {
    if (this.txStarted) {
      throw new Error('Transaction already started')
    }
    const db: Connection = await DatabaseService.getDatabase()
    const decisionQuestionIds: { id: string }[] = await db.query(`
      select id from question
      where question_group_id in (
        select question_group_id from section_question_group
        where section_id in (
          select section_id from form_section
          where form_id = ?
          and deleted_at is null
        )
        and deleted_at is null
      )
      and id in (
        select question_id from question_parameter
        where parameter_id = ? and val = "1"
        and deleted_at is null
      )
      and deleted_at is null`, [formId, PT.dictator_keep_decision])

    const receiverQuestionIds: { id: string }[] = await db.query(`
        select id from question
        where question_group_id in (
          select question_group_id from section_question_group
          where section_id in (
            select section_id from form_section
            where form_id = ?
            and deleted_at is null
          )
          and deleted_at is null
        )
        and id in (
          select question_id from question_parameter
          where parameter_id = ? and val = "1"
          and deleted_at is null
        )
        and deleted_at is null
      `, [formId, PT.dictator_receiver])

    const decisionIdsInStr = decisionQuestionIds.map(q => `"${q.id}"`).join(', ')
    const receiverIdsInStr = receiverQuestionIds.map(q => `"${q.id}"`).join(', ')
    const maxVals = await db.query(`
    select parameter_id, question_id, val from question_parameter
    where parameter_id in ("${PT.json}", "${PT.max}")
    and deleted_at is null
    and question_id in (${decisionIdsInStr})`)
    const maxValsMap = new Map<string, number>()
    for (const v of maxVals) {
      if (+v.parameter_id === PT.json) {
        const d = JSON.parse(v.val)
        maxValsMap.set(v.question_id, d.quantity)
      } else if (+v.parameter_id === PT.max) {
        maxValsMap.set(v.question_id, +v.val)
      } else {
        throw new Error('Unexpected parameter id: ' + v.parameter_id)
      }
    }
    const decisionData = await db.query(`
      select
        d.val as value,
        qd.question_id as questionId,
        rqd.question_id as receiverQuestionId,
        s.id as surveyId,
        s.respondent_id as respondentId
      from datum d
      inner join question_datum qd on d.question_datum_id = qd.id and qd.deleted_at is null
      inner join survey s on s.id = qd.survey_id and s.deleted_at is null and s.completed_at is not null
      inner join question_datum rqd on rqd.survey_id = qd.survey_id and rqd.question_id in (${receiverIdsInStr}) and rqd.deleted_at is null
      where qd.question_id in (${decisionIdsInStr})
      and d.deleted_at is null
      and rqd.id not in (select question_datum_id from datum where question_datum_id = rqd.id and deleted_at is null and val is not null)
    `)
    console.log('questions', decisionIdsInStr)
    const res = decisionData.map(d => ({
      ...d,
      value: +d.value,
      max: maxValsMap.get(d.questionId),
    }))
    console.log('decisions', res)
    return res
  }

  async startSave (pairs: Pair[]) {
    if (this.txStarted) {
      throw new Error('Transaction already started')
    }
    // open a transaction and save pair data
    const db: Connection = await DatabaseService.getDatabase()
    this.runner = db.createQueryRunner()
    try {
      this.txStarted = true
      await this.runner.startTransaction()
    } catch (err) {
      this.txStarted = false
    }
    try {
      for (const pair of pairs) {
        const question = await this.runner.manager.findOne(Question, {
          id: pair.decider.receiverQuestionId,
        })
        if (!question) {
          throw new Error('Receiver question not found: ' + pair.decider.receiverQuestionId)
        }
        let qd: QuestionDatum = await this.runner.manager.findOne(QuestionDatum, {
          questionId: pair.decider.receiverQuestionId,
          surveyId: pair.decider.surveyId,
          deletedAt: IsNull(),
        })
        if (!qd) {
          qd = new QuestionDatum()
          qd.id = uuid()
          qd.questionId = pair.decider.receiverQuestionId
          qd.surveyId = pair.decider.surveyId
          qd.answeredAt = new Date()
          qd = await this.runner.manager.save(qd)
        }

        let edge = new Edge()
        edge.id = uuid()
        edge.sourceRespondentId = pair.decider.respondentId
        edge.targetRespondentId = pair.receiver.respondentId
        edge.note = 'dictator-async'
        edge = await this.runner.manager.save(edge)

        let datum = new Datum()
        datum.id = uuid()
        datum.name = question.varName
        datum.eventOrder = 1
        datum.randomSortOrder = randomIntBits(53)
        datum.questionDatumId = qd.id
        datum.val = edge.id
        datum.edgeId = edge.id
        datum = await this.runner.manager.save(datum)
      }
    } catch (err) {
      await this.runner.rollbackTransaction()
      throw err
    }
  }

  async completeSave (): Promise<void> {
    if (!this.txStarted || !this.runner) {
      throw new Error('Transaction not started')
    }
    await this.runner.commitTransaction()
    this.txStarted = false
  }

  async rollbackSave (): Promise<void> {
    if (!this.txStarted || !this.runner) {
      throw new Error('Cannot rollback transaction that has not started')
    }
    await this.runner.rollbackTransaction()
    this.txStarted = false
  }
}
