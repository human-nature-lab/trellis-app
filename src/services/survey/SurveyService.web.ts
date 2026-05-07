import http, { adminInst } from '../http/AxiosInstance'
import SurveyServiceInterface from './SurveyServiceInterface'
import Survey from '../../entities/trellis/Survey'
import { uriTemplate } from '../http/WebUtils'

export class SurveyService implements SurveyServiceInterface {
  async getSurveyById (surveyId: string): Promise<Survey> {
    surveyId = encodeURIComponent(surveyId)
    const res = await http().get(`/survey/${surveyId}/`)
    if (res.status !== 200) {
      throw new Error(res.data.msg)
    }
    return new Survey().fromSnakeJSON(res.data.survey)
  }

  async getSurvey (studyId: string, respondentId: string, formId: string): Promise<Survey> {
    studyId = encodeURIComponent(studyId)
    respondentId = encodeURIComponent(respondentId)
    formId = encodeURIComponent(formId)
    const res = await http().get(`study/${studyId}/respondent/${respondentId}/form/${formId}/survey`)
    if (res.status !== 200) {
      throw new Error(res.data.msg)
    }
    return new Survey().fromSnakeJSON(res.data.survey)
  }

  async getRespondentSurveys (studyId: string, respondentId: string): Promise<Survey[]> {
    studyId = encodeURIComponent(studyId)
    respondentId = encodeURIComponent(respondentId)
    const res = await http().get(`study/${studyId}/respondent/${respondentId}/surveys`)
    if (res.status >= 300) {
      throw new Error(res.data.msg)
    }
    return res.data.surveys.map(s => new Survey().fromSnakeJSON(s))
  }

  async create (studyId: string, respondentId: string, formId: string) {
    studyId = encodeURIComponent(studyId)
    formId = encodeURIComponent(formId)
    respondentId = encodeURIComponent(respondentId)
    const res = await http().post(`study/${studyId}/respondent/${respondentId}/form/${formId}/survey`)
    if (res.status >= 300) {
      throw new Error(res.data.msg)
    }
    return new Survey().fromSnakeJSON(res.data.survey)
  }

  async complete (surveyId: string) {
    const res = await http().post(uriTemplate('survey/{survey}/complete', [surveyId]))
    if (res.status >= 300) {
      throw new Error(res.data.msg)
    }
    return new Survey().fromSnakeJSON(res.data.survey)
  }

  async uncomplete (surveyId: string) {
    const res = await http().post(uriTemplate('survey/{survey}/uncomplete', [surveyId]))
    if (res.status >= 300) {
      throw new Error(res.data.msg)
    }
    return new Survey().fromSnakeJSON(res.data.survey)
  }

  async transfer (surveyId: string, newRespondentId: string): Promise<{ success: boolean, message: string }> {
    const res = await adminInst.post(uriTemplate('survey/{survey}/transfer', [surveyId]), {
      newRespondentId: newRespondentId,
    })
    if (res.status !== 200) {
      throw new Error(res.data.msg)
    }
    return {
      success: true,
      message: res.data.msg,
    }
  }
}
