import http from '../http/AxiosInstance'
export default class SurveyService {
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
