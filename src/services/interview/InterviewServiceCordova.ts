import Interview from '../../entities/trellis/Interview'
import {now} from '../DateService'
import DatabaseService from '../database/DatabaseService'
import InterviewServiceAbstract from './InterviewServiceAbstract'
import Action from '../../entities/trellis/Action'
import InterviewDeltaInterface from './InterviewDeltaInterface'
import QuestionDatum from '../../entities/trellis/QuestionDatum'
import PreloadAction from '../../entities/trellis/PreloadAction'
import UserService from '../user/UserService'
import SurveyConditionTag from '../../entities/trellis/SurveyConditionTag'
import SectionConditionTag from '../../entities/trellis/SectionConditionTag'
import RespondentConditionTag from '../../entities/trellis/RespondentConditionTag'
import {IsNull, Repository, SelectQueryBuilder} from 'typeorm'
import Survey from '../../entities/trellis/Survey'
import Datum from '../../entities/trellis/Datum'
import InterviewDataInterface from './InterviewDataInterface'
import {randomIntBits} from "../../classes/M";

export default class InterviewServiceCordova extends InterviewServiceAbstract {

  public async getInterview (interviewId: string): Promise<Interview> {
    const repo = await DatabaseService.getRepository(Interview)
    const interview = await repo.findOne({
      where: {
        id: interviewId,
        deletedAt: IsNull()
      },
      relations: ['survey', 'user', 'survey.respondent', 'survey.form', 'survey.respondent.geos', 'survey.respondent.geos.geo', 'survey.respondent.geos.geo.nameTranslation', 'survey.respondent.geos.geo.geoType']
    })
    return interview
  }

  public async create (surveyId: string, coordinates: Coordinates): Promise<Interview> {
    const repo = await DatabaseService.getRepository(Interview)
    const user = await UserService.getCurrentUser()
    let interview = new Interview()
    interview.startTime = now()
    interview.surveyId = surveyId
    interview.userId = user.id
    if (coordinates && coordinates.latitude) {
      interview.latitude = coordinates.latitude ? coordinates.latitude.toString(): null
      interview.longitude = coordinates.longitude ? coordinates.longitude.toString(): null
      interview.altitude = coordinates.altitude ? coordinates.altitude.toString(): null
    }
    interview = await repo.save(interview)
    return await this.getInterview(interview.id)
  }

  public async complete (id: string): Promise<void> {
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
    let preloadActions = await q.getMany()
    const insertActions = preloadActions.map((p, i) => {
      let a = new Action()
      a.preloadActionId = p.id
      a.payload = p.payload
      a.actionType = p.actionType
      a.questionId = p.questionId
      a.interviewId = interviewId
      a.createdAt = now()
      a.sectionFollowUpRepetition = 0
      a.sectionRepetition = 0
      a.randomSortOrder = randomIntBits(53)
      a.sortOrder = i
      return a
    })
    const repo = await DatabaseService.getRepository(Action)
    if (preloadActions.length) {
      let res = await repo.insert(insertActions)
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

  public async saveActions (interviewId: string, actions: Action[]): Promise<any> {
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
    return (await DatabaseService.getRepository(QuestionDatum)).createQueryBuilder('question_datum')
      .where(qb => {
        return `question_datum.surveyId = ${this.surveyIdSubQuery(interviewId, qb)}`
      })
      .andWhere('question_datum.deleted_at is null')
      .leftJoinAndSelect('question_datum.data', 'datum', 'datum.deleted_at is null')
      .getMany()
  }

  private async getSurveyConditionTags (interviewId: string): Promise<SurveyConditionTag[]> {
    return await (await DatabaseService.getRepository(SurveyConditionTag)).createQueryBuilder('survey_condition_tag')
      .where(qb => `survey_condition_tag.surveyId = ${this.surveyIdSubQuery(interviewId, qb)}`)
      .andWhere('survey_condition_tag.deletedAt is null')
      .getMany()
  }

  private async getSectionConditionTags (interviewId: string): Promise<SectionConditionTag[]> {
    return await (await DatabaseService.getRepository(SectionConditionTag)).createQueryBuilder('section_condition_tag')
      .where(qb => {
        return `section_condition_tag.surveyId = ${this.surveyIdSubQuery(interviewId, qb)}`
      })
      .andWhere('section_condition_tag.deletedAt is null')
      .leftJoinAndSelect('section_condition_tag.conditionTag', 'conditionTag')
      .getMany()
  }

  private async getRespondentConditionTags (interviewId: string): Promise<RespondentConditionTag[]> {
    return await (await DatabaseService.getRepository(RespondentConditionTag)).createQueryBuilder('respondent_condition_tag')
      .where(qb => {
        return `respondent_condition_tag.respondentId = ${this.respondentIdSubQuery(interviewId, qb)}`
      })
      .andWhere('respondent_condition_tag.deletedAt is null')
      .leftJoinAndSelect('respondent_condition_tag.conditionTag', 'conditionTag')
      .getMany()
  }

  public async getData (interviewId: string): Promise<InterviewDataInterface> {
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

  public async saveData (interviewId: string, diff: InterviewDeltaInterface): Promise<void> {
    console.log('diff', diff)
    const connection = await DatabaseService.getDatabase()

    return connection.transaction(async manager => {
      console.log('saveData transaction open')
      await manager.query(`PRAGMA defer_foreign_keys = true;`)

      // Remove stuff first
      for (let removedDatum of diff.data.datum.removed) {
        await manager.update(Datum, { id: removedDatum.id }, { deletedAt: new Date() })
      }
      for (let removedQuestionDatum of diff.data.questionDatum.removed) {
        await manager.update(QuestionDatum, { id: removedQuestionDatum.id }, { deletedAt: new Date() })
      }

      // Insert 2nd
      for (let addedQuestionDatum of diff.data.questionDatum.added) {
        let questionDatumExists = await manager.findOne(QuestionDatum, {id: addedQuestionDatum.id})
        if (questionDatumExists instanceof QuestionDatum) {
          // Just undelete it
          await manager.update(QuestionDatum, { id: addedQuestionDatum.id }, { deletedAt: null })
        } else {
          await manager.insert(QuestionDatum,
            {
              id: addedQuestionDatum.id,
              questionId: addedQuestionDatum.questionId,
              surveyId: addedQuestionDatum.surveyId,
              followUpDatumId: addedQuestionDatum.followUpDatumId,
              sectionRepetition: addedQuestionDatum.sectionRepetition,
              answeredAt: addedQuestionDatum.answeredAt,
              skippedAt: addedQuestionDatum.skippedAt,
              dkRf: addedQuestionDatum.dkRf,
              dkRfVal: addedQuestionDatum.dkRfVal,
              createdAt: addedQuestionDatum.createdAt,
              updatedAt: addedQuestionDatum.updatedAt,
              deletedAt: addedQuestionDatum.deletedAt,
              noOne: addedQuestionDatum.noOne
            })
        }
      }

      for (let addedDatum of diff.data.datum.added) {
        let datumExists = await manager.findOne(Datum, {id: addedDatum.id})
        if (datumExists instanceof Datum) {
          // Just undelete it
          await manager.update(Datum, {id: addedDatum.id}, {deletedAt: null})
        } else {
          if (addedDatum.val === null) {
            console.log('addedDatum.val === null', addedDatum)
          }
          await manager.insert(Datum,
            {
              id: addedDatum.id,
              choiceId: addedDatum.choiceId,
              datumTypeId: addedDatum.datumTypeId,
              edgeId: addedDatum.edgeId,
              eventOrder: addedDatum.eventOrder,
              geoId: addedDatum.geoId,
              name: addedDatum.name,
              photoId: addedDatum.photoId,
              questionDatumId: addedDatum.questionDatumId,
              respondentGeoId: addedDatum.respondentGeoId,
              respondentNameId: addedDatum.respondentNameId,
              rosterId: addedDatum.rosterId,
              sortOrder: addedDatum.sortOrder,
              surveyId: addedDatum.surveyId,
              val: addedDatum.val,
              randomSortOrder: addedDatum.randomSortOrder,
              actionId: addedDatum.actionId,
              createdAt: addedDatum.createdAt,
              updatedAt: addedDatum.updatedAt,
              deletedAt: addedDatum.deletedAt
            })
        }
      }

      // Update last
      for (let updatedQuestionDatum of diff.data.questionDatum.modified) {
        await manager.update(QuestionDatum, { id: updatedQuestionDatum.id },
          {
            sectionRepetition: updatedQuestionDatum.sectionRepetition,
            followUpDatumId: updatedQuestionDatum.followUpDatumId,
            answeredAt: updatedQuestionDatum.answeredAt,
            skippedAt: updatedQuestionDatum.skippedAt,
            dkRf: updatedQuestionDatum.dkRf,
            dkRfVal: updatedQuestionDatum.dkRfVal,
            noOne: updatedQuestionDatum.noOne
          })
      }

      for (let updatedDatum of diff.data.datum.modified) {
        await manager.update(Datum, { id: updatedDatum.id },
          {
            name: updatedDatum.name,
            val: updatedDatum.val,
            choiceId: updatedDatum.choiceId,
            parentDatumId: updatedDatum.parentDatumId,
            datumTypeId: updatedDatum.datumTypeId,
            sortOrder: updatedDatum.sortOrder,
            rosterId: updatedDatum.rosterId,
            eventOrder: updatedDatum.eventOrder,
            questionDatumId: updatedDatum.questionDatumId,
            geoId: updatedDatum.geoId,
            edgeId: updatedDatum.edgeId,
            photoId: updatedDatum.photoId,
            randomSortOrder: updatedDatum.randomSortOrder,
            actionId: updatedDatum.actionId,
          })
      }

      for (let addedRespondentConditionTag of diff.conditionTags.respondent.added) {
        if (await manager.findOne(RespondentConditionTag, addedRespondentConditionTag.id) === undefined) {
          // Doesn't exist, save it
          await manager.save(addedRespondentConditionTag)
        } else {
          // Exists, set deleted_at to null
          await manager.update(RespondentConditionTag, { id: addedRespondentConditionTag.id }, { deletedAt: null })
        }
      }

      for (let addedSectionConditionTag of diff.conditionTags.section.added) {
        if (await manager.findOne(SectionConditionTag, addedSectionConditionTag.id) === undefined) {
          // Doesn't exist, save it
          await manager.save(addedSectionConditionTag)
        } else {
          // Exists, set deleted_at to null
          await manager.update(SectionConditionTag, { id: addedSectionConditionTag.id }, { deletedAt: null })
        }
      }

      for (let addedSurveyConditionTag of diff.conditionTags.survey.added) {
        if (await manager.findOne(SurveyConditionTag, addedSurveyConditionTag.id) === undefined) {
          // Doesn't exist, save it
          await manager.save(addedSurveyConditionTag)
        } else {
          // Exists, set deleted_at to null
          await manager.update(SurveyConditionTag, { id: addedSurveyConditionTag.id }, { deletedAt: null })
        }
      }

      for (let removedRespondentConditionTag of diff.conditionTags.respondent.removed) {
        await manager.update(RespondentConditionTag, { id: removedRespondentConditionTag.id }, { deletedAt: new Date() })
      }

      for (let removedSectionConditionTag of diff.conditionTags.section.removed) {
        await manager.update(SectionConditionTag, { id: removedSectionConditionTag.id }, { deletedAt: new Date() })
      }

      for (let removedSurveyConditionTag of diff.conditionTags.survey.removed) {
        await manager.update(SurveyConditionTag, { id: removedSurveyConditionTag.id }, { deletedAt: new Date() })
      }

      console.log('saveData transaction closing')
    })

  }

  public async getPreload (interviewId: string) {
    return null
  }

  public async getLatestInterviewPosition (respondentId: string, tolerance: number) {
    const repo = await DatabaseService.getRepository(Interview)
    const interview = await repo.createQueryBuilder('interview')
      .where('interview.survey_id in (select id from survey where respondent_id = :respondentId)', { respondentId })
      .andWhere('interview.createdAt >= :oldestDate', {oldestDate: this.getDateFromTolerance(tolerance)})
      .andWhere('interview.latitude is not NULL')
      .getOne()
    if (interview) {
      return {
        latitude: interview.latitude,
        longitude: interview.longitude,
        altitude: interview.altitude
      } as Coordinates
    } else {
      throw Error('No previous interview matching these criteria')
    }
  }

}
