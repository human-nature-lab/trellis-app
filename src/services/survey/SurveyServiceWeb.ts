import http from '../http/AxiosInstance'
import SurveyServiceInterface from './SurveyServiceInterface'
import Survey from '../../entities/trellis/Survey'
import { uriTemplate } from '../http/WebUtils'
export class SurveyServiceWeb implements SurveyServiceInterface {
  async getSurveyById (surveyId: string): Promise<Survey> {
    surveyId = encodeURIComponent(surveyId)
    const res = await http().get(`/survey/${surveyId}/`)
    return new Survey().fromSnakeJSON(res.data.survey)
  }

  async getSurvey (studyId: string, respondentId: string, formId: string): Promise<Survey> {
    studyId = encodeURIComponent(studyId)
    respondentId = encodeURIComponent(respondentId)
    formId = encodeURIComponent(formId)
    const res = await http().get(`study/${studyId}/respondent/${respondentId}/form/${formId}/survey`)
    return new Survey().fromSnakeJSON(res.data.survey)
  }

  async getRespondentSurveys (studyId: string, respondentId: string): Promise<Survey[]> {
    studyId = encodeURIComponent(studyId)
    respondentId = encodeURIComponent(respondentId)
    const res = await http().get(`study/${studyId}/respondent/${respondentId}/surveys`)
    return res.data.surveys.map(s => new Survey().fromSnakeJSON(s))
  }

  async create (studyId: string, respondentId: string, formId: string) {
    studyId = encodeURIComponent(studyId)
    formId = encodeURIComponent(formId)
    respondentId = encodeURIComponent(respondentId)
    const res = await http().post(`study/${studyId}/respondent/${respondentId}/form/${formId}/survey`)
    return new Survey().fromSnakeJSON(res.data.survey)
  }

  async complete (surveyId: string) {
    const res = await http().post(uriTemplate('survey/{survey}/complete', [surveyId]))
    return new Survey().fromSnakeJSON(res.data.survey)
  }

  async uncomplete (surveyId: string) {
    const res = await http().post(uriTemplate('survey/{survey}/uncomplete', [surveyId]))
    return new Survey().fromSnakeJSON(res.data.survey)
  }
}
