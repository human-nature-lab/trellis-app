import http from '@/services/http/AxiosInstance'
export default class RespondentServiceWeb {
  /**
   * Get the fills for this respondent by respondent id
   * @param {String} respondentId
   * @returns {Promise<Object>}
   */
  static getRespondentFillsById (respondentId) {
    respondentId = encodeURIComponent(respondentId)
    return http().get(`respondent/${respondentId}/fills`)
      .then(res => res.data.fills)
  }

  /**
   * Get a respondent by id
   * @param {String} respondentId - A valid respondentId
   * @returns {Promise<Object>} - Resolves to the respondent
   */
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

  /**
   * Get a page of respondents in an array
   * @param {String} studyId
   * @param {Number} page
   * @param {Number} size
   * @returns {Promise<Array<Object>>}
   */
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

  /**
   * Get the results of a search query
   * @param {String} studyId - The study id
   * @param {String} query - The query to search
   * @param {Object} filter
   * @param {Number} page
   * @param {Number} size
   * @returns {Promise<Array<Object>>}
   */
  static getSearchPage (studyId, query, filter, page = 0, size = 50) {
    let params = {
      q: query
    }
    if (filter.conditionTags) {
      params.c = filter.conditionTags.join(',')
    }
    studyId = encodeURIComponent(studyId)
    return http().get(`study/${studyId}/respondents/search`, {
      params: params,
      query: {
        offset: page * size,
        limit: size
      }
    }).then(res => {
      if (res.data && res.data.respondents) {
        return res.data.respondents.slice(0, size)
      } else {
        throw new Error('Unable to complete query')
      }
    })
  }
}
