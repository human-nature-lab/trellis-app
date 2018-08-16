import http from '../http/AxiosInstance'
import SurveyServiceInterface from "./SurveyServiceInterface";
import Survey from "../../entities/trellis/Survey";
export default class SurveyService implements SurveyServiceInterface {

  /**
   * Get an existing survey by form id
   * @param {string} studyId
   * @param {string} respondentId
   * @param {string} formId
   * @returns {Promise<Object|null>}
   */
  async getSurvey (studyId, respondentId, formId) {
    studyId = encodeURIComponent(studyId)
    respondentId = encodeURIComponent(respondentId)
    formId = encodeURIComponent(formId)
    let res = await http().get(`study/${studyId}/respondent/${respondentId}/form/${formId}/survey`)
    return new Survey().fromSnakeJSON(res.data.survey)
  }

  /**
   * Get all of the forms for a respondent in this study
   * @param {String} studyId - The study id
   * @param {String} respondentId - The respondent id
   * @returns {Promise<Array>}
   */
  async getRespondentSurveys (studyId, respondentId) {
    studyId = encodeURIComponent(studyId)
    respondentId = encodeURIComponent(respondentId)
    let res = await http().get(`study/${studyId}/respondent/${respondentId}/surveys`)
    return res.data.surveys.map(s => new Survey().fromSnakeJSON(s))
  }

  /**
   * Create a new survey
   * @param {String} studyId
   * @param {String} respondentId
   * @param {String} formId
   * @returns {*|AxiosPromise<any>}
   */
  async create (studyId, respondentId, formId) {
    studyId = encodeURIComponent(studyId)
    formId = encodeURIComponent(formId)
    respondentId = encodeURIComponent(respondentId)
    let res = await http().post(`study/${studyId}/respondent/${respondentId}/form/${formId}/survey`)
    return new Survey().fromSnakeJSON(res.data.survey)
  }
}
