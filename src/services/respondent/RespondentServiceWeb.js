import http from '@/services/http/AxiosInstance'
import storage from '@/services/storage/StorageService'
export default class RespondentServiceWeb {
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
  static getRespondentsPage (page = 0, size = 50) {
    let studyId = storage.get('studyId', 'string')
    return http().get(`study/${studyId}/respondents`)
      .then(res => {
        if (res.data.respondents) {
          return res.data.respondents
        } else {
          throw Error('Unable to get respondents')
        }
      })
  }
  static getSearchPage (query, filter, page = 0, size = 50) {
    let studyId = storage.get('studyId', 'string')
    return http().get(`study/${studyId}/respondents/search`, {
      params: {
        q: query,
        c: filter.conditionTags.join(',')
      }
    }).then(res => {
      if (res.data && res.data.respondents) {
        return res.data.respondents
      } else {
        throw new Error('Unable to complete query')
      }
    })
  }
}
