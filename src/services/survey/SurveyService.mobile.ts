import SurveyServiceInterface from './SurveyServiceInterface'
import Survey from '../../entities/trellis/Survey'
import DatabaseService from '../database'
import uuidv4 from 'uuid/v4'
import { now } from '../DateService'
import { IsNull } from 'typeorm'

export class SurveyService implements SurveyServiceInterface {
  async getSurveyById (surveyId: string): Promise<Survey> {
    const repo = await DatabaseService.getRepository(Survey)
    return repo.findOne({
      where: {
        id: surveyId,
        deletedAt: IsNull()
      }
    })
  }

  async getSurvey (studyId: string, respondentId: string, formId: string): Promise<Survey> {
    const repo = await DatabaseService.getRepository(Survey)
    return repo.findOne({
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
    const surveys = await repo.find({
      where: {
        deletedAt: IsNull(),
        respondentId: respondentId,
        studyId: studyId,
      },
      relations: ['interviews', 'interviews.user', 'form'],
    })

    return surveys
  }

  async create (studyId: string, respondentId: string, formId: string): Promise<Survey> {
    const repo = await DatabaseService.getRepository(Survey)
    const survey = new Survey()
    survey.id = uuidv4()
    survey.respondentId = respondentId
    survey.studyId = studyId
    survey.formId = formId
    survey.createdAt = now()
    survey.updatedAt = now()
    await repo.save(survey)
    return survey
  }

  async complete (surveyId: string): Promise<Survey> {
    const repo = await DatabaseService.getRepository(Survey)
    const survey = await repo.findOne({
      id: surveyId
    })
    survey.completedAt = now()
    await repo.save(survey)
    return survey
  }

  async uncomplete (): Promise<Survey> {
    throw new Error('not implemented')
  }
}
