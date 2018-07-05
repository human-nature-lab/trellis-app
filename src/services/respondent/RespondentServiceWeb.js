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
   * @param {Object} filters
   * @param {Number} page
   * @param {Number} size
   * @param {String} respondentId - The respondent associated with this search
   * @param {Array} filters.conditionTags - Array of condition tag names. This array is treated as a logical AND
   * @param {Array} filters.geos - Array of geo ids. This array is treated as a logical OR
   * @returns {Promise<Array<Object>>}
   */
  static getSearchPage (studyId, query, filters, page = 0, size = 50, respondentId = null) {
    let params = {
      q: query,
      offset: page * size,
      limit: size,
      associated_respondent_id: respondentId
    }
    if (filters.conditionTags) {
      params.c = filters.conditionTags.join(',')
    }
    if (filters.geos) {
      params.g = filters.geos.join(',')
    }
    studyId = encodeURIComponent(studyId)
    return http().get(`study/${studyId}/respondents/search`, {
      params: params
    }).then(res => {
      if (res.data && res.data.respondents) {
        return res.data.respondents.slice(0, size)
      } else {
        throw new Error('Unable to complete query')
      }
    })
  }

  /**
   * Add a name to the respondent
   * @param {string} respondentId
   * @param {string} name
   * @param {boolean} [isDisplayName]
   * @param {string} [localeId]
   * @returns {*}
   */
  static addName (respondentId, name, isDisplayName = null, localeId = null) {
    respondentId = encodeURIComponent(respondentId)
    return http().post(`respondent/${respondentId}/name`, {
      name: name,
      is_display_name: isDisplayName,
      locale_id: localeId
    }).then(res => res.data.name)
  }

  /**
   * Modify a respondent name
   * @param {string} respondentId
   * @param {string} respondentNameId
   * @param {string} newName
   * @param {boolean} [isDisplayName]
   * @param {string} [localeId]
   * @returns {Promise<Object>}
   */
  static editName (respondentId, respondentNameId, newName, isDisplayName = null, localeId = null) {
    respondentNameId = encodeURIComponent(respondentNameId)
    return http().put(`respondent/${respondentId}/name/${respondentNameId}`, {
      name: newName,
      is_display_name: isDisplayName,
      locale_id: localeId
    }).then(res => res.data.name)
  }

  /**
   * Delete a respondent name
   * @param {string} respondentId
   * @param {string} respondentNameId
   * @returns {Promise<Object>}
   */
  static removeName (respondentId, respondentNameId) {
    respondentId = encodeURIComponent(respondentId)
    respondentNameId = encodeURIComponent(respondentNameId)
    return http().delete(`respondent/${respondentId}/name/${respondentNameId}`)
  }

  /**
   * Add a new respondent. Can optionally be associated with another respondent
   * @param {String} studyId
   * @param {String} name
   * @param {String} [geoId]
   * @param {String} [associatedRespondentId] - Add this argument if you want the added respondent to only be visible in
   * surveys being conducted for the associated respondent.
   */
  static createRespondent (studyId, name, geoId = null, associatedRespondentId = null) {
    return http().post(`study/${studyId}/respondent`, {
      name: name,
      geo_id: geoId,
      associated_respondent_id: associatedRespondentId
    }).then(res => res.data.respondent)
  }
}
