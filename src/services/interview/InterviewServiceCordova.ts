import Interview from '../../entities/trellis/Interview'
import {now} from '../DateService'
import DatabaseService from '../database/DatabaseService'
import InterviewServiceInterface from './InterviewServiceInterface'
import Action from '../../entities/trellis/Action'
import InterviewDeltaInterface from './InterviewDeltaInterface'
import QuestionDatum from '../../entities/trellis/QuestionDatum'
import PreloadAction from '../../entities/trellis/PreloadAction'
import UserService from '../user/UserService'
import SurveyConditionTag from "../../entities/trellis/SurveyConditionTag";
import SectionConditionTag from "../../entities/trellis/SectionConditionTag";
import RespondentConditionTag from "../../entities/trellis/RespondentConditionTag";
import {IsNull, QueryRunner, Repository, SelectQueryBuilder} from "typeorm";
import Survey from "../../entities/trellis/Survey";
import Datum from "../../entities/trellis/Datum";
import ConditionTag from "../../entities/trellis/ConditionTag";

export default class InterviewServiceCordova implements InterviewServiceInterface {

  public async getInterview (interviewId: string) {
    const repo = await DatabaseService.getRepository(Interview)
    const interview = await repo.findOne({
      where: {
        id: interviewId,
        deletedAt: IsNull()
      },
      relations: ['survey', 'user', 'survey.respondent', 'survey.form']
    })
    return interview
  }

  public async create (surveyId: string) {
    const repo = await DatabaseService.getRepository(Interview)
    const user = await UserService.getCurrentUser()
    let interview = new Interview()
    interview.startTime = now()
    interview.surveyId = surveyId
    interview.userId = user.id
    interview = await repo.save(interview)
    return await this.getInterview(interview.id)
  }

  public async complete (id: string) {
    const repo = await DatabaseService.getRepository(Interview)
    let interview = await repo.createQueryBuilder()
      .update(Interview)
      .set({ endTime: now()})
      .where('id = :id', { id })
      .execute()
    return interview
  }

  private async copyPreloadActions (interviewId: string): Promise<Repository<Action>> {
    const repository = await DatabaseService.getRepository(PreloadAction)
    const queryBuilder = await repository.createQueryBuilder('preload_action')
    let q = queryBuilder.where(`preload_action.respondentId = (
      select respondent_id from survey where id = (select survey_id from interview where id = :interviewId)
    )`)
      .andWhere(`preload_action.questionId in (
      select id from question where question_group_id in (
        select question_group_id from section_question_group where section_id in (
          select section_id from form_section where form_id = (
            select form_id from survey where id = (select survey_id from interview where id = :interviewId)
          )
        )
      )
    )`).andWhere(`preload_action.id not in (
      select preload_action_id from action where interview_id in (
        select id from interview where survey_id = (select survey_id from interview where id = :interviewId)
      )
    )`, {
        interviewId
      })
    console.log('q.getQuery()', q.getQuery())
    let preloadActions = await q.getMany()
    const insertActions = preloadActions.map(p => {
      let a = new Action()
      a.preloadActionId = p.id
      a.payload = p.payload
      a.actionType = p.actionType
      a.questionId = p.questionId
      a.interviewId = interviewId
      a.createdAt = now()
      a.sectionFollowUpRepetition = 0
      a.sectionRepetition = 0
      return a
    })
    const repo = await DatabaseService.getRepository(Action)
    if (preloadActions.length) {
      let res = await repo.insert(insertActions)
      console.log('copied actions', res)
    }
    return repo
  }

  public async getActions (interviewId: string): Promise<Action[]> {
    // Get preload actions for this respondent_id and question_id (via form_id)
    // that have not already been copied into the action table
    let repo = await this.copyPreloadActions(interviewId)
    let actions = await repo.createQueryBuilder('action')
      .where(qb => {
        return 'action.interviewId in ' +  qb.subQuery().select('interview.id')
          .from(Interview, 'interview')
          .where(qb2 => {
            return 'interview.surveyId = ' + qb2.subQuery().select('interview.surveyId')
              .from(Interview, 'interview')
              .where('interview.id = :interviewId', {interviewId})
              .getQuery()
          }).getQuery()
      }).getMany()
    return actions
  }

  public async saveActions (interviewId: string, actions: Action[]) {
    const repo = await DatabaseService.getRepository(Action)
    let res = await repo.insert(actions)
    return res
  }

  private surveyIdSubQuery (interviewId: string, qb: SelectQueryBuilder<any>): string {
    return qb.subQuery()
      .select('interview.surveyId')
      .from(Interview, 'interview')
      .where('interview.id = :interviewId', {interviewId})
      .getQuery()
  }

  private respondentIdSubQuery (interviewId: string, qb: SelectQueryBuilder<any>): string {
    return qb.subQuery()
      .select('survey.respondentId')
      .from(Survey, 'survey')
      .where(qb2 => `survey.id = ${this.surveyIdSubQuery(interviewId, qb2)}`)
      .getQuery()
  }

  private async getQuestionDatum (interviewId: string): Promise<QuestionDatum[]> {
    return await (await DatabaseService.getRepository(QuestionDatum)).createQueryBuilder('question_datum')
      .where(qb => {
        return `question_datum.surveyId = ${this.surveyIdSubQuery(interviewId, qb)}`
      })
      .leftJoinAndSelect('question_datum.data', 'datum')
      .getMany()
  }

  private async getSurveyConditionTags (interviewId: string): Promise<SurveyConditionTag[]> {
    return await (await DatabaseService.getRepository(SurveyConditionTag)).createQueryBuilder('survey_condition_tag')
      .where(qb => `survey_condition_tag.surveyId = ${this.surveyIdSubQuery(interviewId, qb)}`).getMany()
  }

  private async getSectionConditionTags (interviewId: string): Promise<SectionConditionTag[]> {
    return await (await DatabaseService.getRepository(SurveyConditionTag)).createQueryBuilder('section_condition_tag')
      .where(qb => {
        return `section_condition_tag.surveyId = ${this.surveyIdSubQuery(interviewId, qb)}`
      })
      .leftJoinAndSelect('section_condition_tag', 'section_condition_tag.conditionTag')
      .getMany()
  }

  private async getRespondentConditionTags (interviewId: string): Promise<RespondentConditionTag[]> {
    return await (await DatabaseService.getRepository(RespondentConditionTag)).createQueryBuilder('respondent_condition_tag')
      .where(qb => {
        return `respondent_condition_tag.respondentId = ${this.respondentIdSubQuery(interviewId, qb)}`
      })
      .leftJoinAndSelect('respondent_condition_tag.conditionTag', 'conditionTag')
      .getMany()
  }

  public async getData (interviewId: string) {
    const data = await this.getQuestionDatum(interviewId)
    const survey = await this.getSurveyConditionTags(interviewId)
    const section = await this.getSectionConditionTags(interviewId)
    const respondent = await this.getRespondentConditionTags(interviewId)
    return {
      data,
      conditionTags: {
        survey,
        section,
        respondent
      }
    }
  }

  public async saveData (interviewId: string, diff: InterviewDeltaInterface) {
    const conn = await DatabaseService.getDatabase()
    const qr = conn.createQueryRunner()

    async function update (qr: QueryRunner, model: any, values: Array<typeof model>) {
      if (values.length) {
        return await qr.manager.save(values)
      }
    }

    async function insert (qr: QueryRunner, model: any, values: Array<typeof model>) {
      if (values.length) {
        return await qr.manager.insert(model, values)
      }
    }

    await qr.startTransaction()
    try {
      // Remove stuff first
      await update(qr, Datum, diff.data.datum.removed)
      await update(qr, QuestionDatum, diff.data.questionDatum.removed)

      // Insert second
      await insert(qr, QuestionDatum, diff.data.questionDatum.added)
      await insert(qr, Datum, diff.data.datum.added)

      // Update last0
      await update(qr, QuestionDatum, diff.data.questionDatum.modified)
      await update(qr, Datum, diff.data.datum.modified)

      // TODO: Save the condition tags as well

      await qr.commitTransaction()
    } catch (err) {
      console.error('Unable to save data')
      console.error(err)
      await qr.rollbackTransaction()
    }


  }

  public async getPreload (interviewId: string) {
    return null
  }
}
