import http from '../http/AxiosInstance'
export default class SurveyService {

  /**
   * Get an existing survey by form id
   * @param {string} studyId
   * @param {string} respondentId
   * @param {string} formId
   * @returns {Promise<Object|null>}
   */
  static getSurvey (studyId, respondentId, formId) {
    studyId = encodeURIComponent(studyId)
    respondentId = encodeURIComponent(respondentId)
    formId = encodeURIComponent(formId)
    return http().get(`study/${studyId}/respondent/${respondentId}/form/${formId}/survey`).then(res => res.data.survey)
  }

  /**
   * Get all of the forms for a respondent in this study
   * @param {String} studyId - The study id
   * @param {String} respondentId - The respondent id
   * @returns {Promise<Array>}
   */
  static getRespondentSurveys (studyId, respondentId) {
    studyId = encodeURIComponent(studyId)
    respondentId = encodeURIComponent(respondentId)
    return http().get(`study/${studyId}/respondent/${respondentId}/surveys`).then(res => {
      if (res.data.surveys) {
        return res.data.surveys
      } else {
        throw Error('Unable to load surveys')
      }
    })
  }

  /**
   * Create a new survey
   * @param {String} studyId
   * @param {String} respondentId
   * @param {String} formId
   * @returns {*|AxiosPromise<any>}
   */
  static create (studyId, respondentId, formId) {
    studyId = encodeURIComponent(studyId)
    formId = encodeURIComponent(formId)
    respondentId = encodeURIComponent(respondentId)
    return http().post(`study/${studyId}/respondent/${respondentId}/form/${formId}/survey`).then(res => {
      return res.data.survey
    })
  }
}
