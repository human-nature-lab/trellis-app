import { Connection } from 'typeorm'
import PT from '@/static/parameter.types'
import DatabaseService from '@/services/database'

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
  surveyId: string
  value: number
  max: number
}

export type CandidatesResponse = Decision[]

export type CandidatesRequest = {
  formId: string
}

export type Pair = {

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
  async getDecisions (formId: string): Promise<Decision[]> {
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
        where parameter_id = ?
      )
      and deleted_at is null`, [formId, PT.dictator_decision])

    const decisionIdsInStr = decisionQuestionIds.map(q => `"${q.id}"`).join(', ')
    const maxVals = await db.query(`
    select question_id, val from question_parameter
    where parameter_id = ?
    and question_id in (${decisionIdsInStr})`, [PT.json])
    const maxValsMap = new Map<string, number>()
    maxVals.forEach(v => maxValsMap.set(v.question_id, v.val))
    const decisionData = await db.query(`
      select
        d.val as value,
        qd.question_id as questionId,
        s.id as surveyId,
        s.respondent_id as respondentId
      from datum d
      inner join question_datum qd on d.question_datum_id = qd.id and qd.deleted_at is null
      inner join survey s on s.id = qd.survey_id and s.deleted_at is null and s.completed_at is not null
      where qd.question_id in (${decisionIdsInStr})
      and d.deleted_at is null
    `)
    console.log('questions', decisionIdsInStr)
    const res = decisionData.map(d => ({
      ...d,
      max: maxValsMap.get(d.questionId),
    }))
    console.log('decisions', res)
    return res
  }

  async startSave (pairs: Pair[]) {
    // TODO: save pairs to database
  }

  async completeSave (): Promise<void> {
    // TODO: complete the transaction
  }

  async rollbackSave (): Promise<void> {
    // TODO: rollback the transaction
  }
}
