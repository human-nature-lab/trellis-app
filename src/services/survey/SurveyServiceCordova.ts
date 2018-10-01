import SurveyServiceInterface from './SurveyServiceInterface'
import Survey from '../../entities/trellis/Survey'
import DatabaseService from '../database/DatabaseService'
import uuidv4 from 'uuid/v4'
import {now} from '../DateService'
import {IsNull} from "typeorm";

export default class SurveyServiceCordova implements SurveyServiceInterface {

  async getSurveyById (surveyId: string): Promise<Survey> {
    const repo = await DatabaseService.getRepository(Survey)
    return await repo.findOne({
      where: {
        id: surveyId,
        deletedAt: IsNull()
      }
    })
  }

  async getSurvey (studyId: string, respondentId: string, formId: string): Promise<Survey> {
    const repo = await DatabaseService.getRepository(Survey)
    return await repo.findOne({
      where: {
        studyId,
        respondentId,
        formId,
        deletedAt: IsNull()
      },
      relations: ['interviews', 'interviews.user']
    })
  }

  async getRespondentSurveys (studyId: string, respondentId: string): Promise<Survey[]> {
    const repo = await DatabaseService.getRepository(Survey)
    let surveys = await repo.find({
      where: {
        deletedAt: IsNull(),
        respondentId: respondentId,
        studyId: studyId
      },
      relations: ['interviews', 'interviews.user']
    })
    // let surveys = await repo.createQueryBuilder('survey')
    //   .where('survey.deletedAt IS NULL')
    //   .where('survey.respondentId = :respondentId', {respondentId})
    //   .where('survey.studyId = :studyId', {studyId})
    //   .leftJoinAndSelect('survey.interviews', 'interview')
    //   .leftJoinAndSelect('interview.user', 'user')
    //   .getMany()

    return surveys
  }

  async create (studyId: string, respondentId: string, formId: string): Promise<Survey> {
    const repo = await DatabaseService.getRepository(Survey)
    let survey = new Survey()
    survey.id = uuidv4()
    survey.respondentId = respondentId
    survey.studyId = studyId
    survey.formId = formId
    survey.createdAt = now()
    survey.updatedAt = now()
    let res = await repo.save(survey)
    return survey
  }

  async complete (surveyId: string): Promise<Survey> {
    const repo = await DatabaseService.getRepository(Survey)
    let survey = await repo.findOne({
      id: surveyId
    })
    survey.completedAt = now()
    let res = await repo.save(survey)
    return survey
  }

}
