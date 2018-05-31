import http from '../http/AxiosInstance'
export default class SurveyService {
  /**
   * Get all of the forms for a respondent in this study
   * @param {String} studyId - The study id
   * @param {String} respondentId - The respondent id
   * @returns {Promise<Array>}
   */
  static getRespondentSurveys (studyId, respondentId) {
    return http().get(`study/${studyId}/surveys`, {
      params: {
        respondent_id: respondentId
      }
    }).then(res => {
      if (res.data.surveys) {
        return res.data.surveys
      } else {
        throw Error('Unable to load surveys')
      }
    })
  }
}
