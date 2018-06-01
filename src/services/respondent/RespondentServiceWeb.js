import http from '@/services/http/AxiosInstance'
export default class RespondentServiceWeb {
  static getRespondentById (respondentId) {
    respondentId = encodeURIComponent(respondentId)
    return http().get(`respondent/${respondentId}`)
      .then(res => {
        if (res.data.respondent) {
          return res.data.respondent
        } else {
          console.error(res)
          throw Error('Unable to get respondent with that id')
        }
      })
  }
  static getRespondentsPage (studyId, page = 0, size = 50) {
    studyId = encodeURIComponent(studyId)
    return http().get(`study/${studyId}/respondents`)
      .then(res => {
        if (res.data.respondents) {
          return res.data.respondents
        } else {
          throw Error('Unable to get respondents')
        }
      })
  }
  static getSearchPage (studyId, query, filter, page = 0, size = 50) {
    let params = {
      q: query
    }
    if (filter.conditionTags) {
      params.c = filter.conditionTags.join(',')
    }
    studyId = encodeURIComponent(studyId)
    return http().get(`study/${studyId}/respondents/search`, {
      params: params
    }).then(res => {
      if (res.data && res.data.respondents) {
        return res.data.respondents
      } else {
        throw new Error('Unable to complete query')
      }
    })
  }
}
