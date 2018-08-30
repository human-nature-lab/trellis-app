import SurveyServiceInterface from './SurveyServiceInterface'
import Survey from '../../entities/trellis/Survey'
import DatabaseService from '../database/DatabaseService'
import uuidv4 from 'uuid/v4'
import {now} from '../DateService'

export default class SurveyServiceCordova implements SurveyServiceInterface {

  async getSurvey (surveyId: string) {
    const repo = await DatabaseService.getRepository(Survey)
    return await repo.findOne({
      deletedAt: null,
      id: surveyId
    })
  }

  async getRespondentSurveys (studyId, respondentId) {
    const repo = await DatabaseService.getRepository(Survey)
    let surveys = await repo.find({
      deletedAt: null,
      respondentId: respondentId,
      studyId: studyId
    })
    return surveys
  }

  async create (studyId, respondentId, formId) {
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

  async complete (surveyId: string) {
    const repo = await DatabaseService.getRepository(Survey)
    let survey = await repo.findOne({
      id: surveyId
    })
    survey.completedAt = now()
    let res = await repo.save(survey)
    return survey
  }

}
