import http from './AxiosInstance'
export default class RespondentService {
  static getRespondentById (respondentId) {
    return http().get(`respondent/${encodeURIComponent(respondentId)}`)
      .then(res => {
        if (res.data.respondent) {
          return res.data.respondent
        } else {
          console.error(res)
          throw Error('Unable to get respondent with that id')
        }
      })
  }
  static getRespondents () {
    return http().get(`respondent`)
      .then(res => {
        if (res.data.respondents) {
          return res.data.respondents
        } else {
          throw Error('Unable to get respondents')
        }
      })
  }
}
