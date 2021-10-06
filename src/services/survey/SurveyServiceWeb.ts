import http from '../http/AxiosInstance'
import SurveyServiceInterface from './SurveyServiceInterface'
import Survey from '../../entities/trellis/Survey'
export default class SurveyServiceWeb implements SurveyServiceInterface {

  async getSurveyById (surveyId: string): Promise<Survey> {
    surveyId = encodeURIComponent(surveyId)
    const res = await http().get(`/survey/${surveyId}/`)
    return new Survey().fromSnakeJSON(res.data.survey)
  }

  async getSurvey (studyId: string, respondentId: string, formId: string): Promise<Survey> {
    studyId = encodeURIComponent(studyId)
    respondentId = encodeURIComponent(respondentId)
    formId = encodeURIComponent(formId)
    let res = await http().get(`study/${studyId}/respondent/${respondentId}/form/${formId}/survey`)
    return new Survey().fromSnakeJSON(res.data.survey)
  }

  async getRespondentSurveys (studyId: string, respondentId: string): Promise<Survey[]> {
    studyId = encodeURIComponent(studyId)
    respondentId = encodeURIComponent(respondentId)
    let res = await http().get(`study/${studyId}/respondent/${respondentId}/surveys`)
    return res.data.surveys.map(s => new Survey().fromSnakeJSON(s))
  }

  async getGeoSurveys (studyId: string, geoId: string): Promise<Survey[]> {
    studyId = encodeURIComponent(studyId)
    geoId = encodeURIComponent(geoId)
    let res = await http().get(`study/${studyId}/geo/${geoId}/surveys`)
    return res.data.surveys.map(s => new Survey().fromSnakeJSON(s))
  }

  // Respondent
  async create (studyId, respondentId, formId) {
    studyId = encodeURIComponent(studyId)
    formId = encodeURIComponent(formId)
    respondentId = encodeURIComponent(respondentId)
    let res = await http().post(`study/${studyId}/respondent/${respondentId}/form/${formId}/survey`)
    return new Survey().fromSnakeJSON(res.data.survey)
  }

  // Geo
  async createGeoSurvey (studyId, geoId, formId) {
    studyId = encodeURIComponent(studyId)
    formId = encodeURIComponent(formId)
    geoId = encodeURIComponent(geoId)
    let res = await http().post(`study/${studyId}/geo/${geoId}/form/${formId}/survey`)
    return new Survey().fromSnakeJSON(res.data.survey)
  }

  async complete (surveyId) {
    surveyId = encodeURIComponent(surveyId)
    let res = await http().post(`survey/${surveyId}/complete`)
    return new Survey().fromSnakeJSON(res.data.survey)
  }
}
