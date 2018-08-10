import http from '../http/AxiosInstance'
import ConditionTagInterface from "./ConditionTagInterface";
export class ConditionTagWeb implements ConditionTagInterface {
  /**
   * Creates a new condition tag
   * @param name
   */
  createConditionTag (name) {
    return http().post(`condition-tag`, {
      name
    }).then(res => res.data.condition_tag)
  }
  /**
   * Create a respondent condition tag with the supplied id
   * @param {String} respondentId
   * @param {String} conditionTagId
   * @returns {Promise<Object>}
   */
  createRespondentConditionTag (respondentId, conditionTagId) {
    respondentId = encodeURIComponent(respondentId)
    conditionTagId = encodeURIComponent(conditionTagId)
    return http().post(`respondent/${respondentId}/condition-tag/${conditionTagId}`).then(res => {
      return res.data.condition_tag
    })
  }

  /**
   * Removes a respondent condition tag
   * @param {String} respondentId
   * @param {String} conditionTagId
   * @returns {*}
   */
  removeRespondentConditionTag (respondentId, conditionTagId) {
    respondentId = encodeURIComponent(respondentId)
    conditionTagId = encodeURIComponent(conditionTagId)
    return http().delete(`respondent/${respondentId}/condition-tag/${conditionTagId}`).then(res => res.data)
  }

  /**
   * Get all of the available condition tags
   * @returns {Array} - An array of condition tags
   */
  respondent () {
    return http().get('/condition-tags/respondent').then(res => res.data.conditions)
  }

  /**
   * Get all condition tags
   * @returns {Promise<Object[]>}
   */
  all () {
    return http().get('/condition-tags').then(res => res.data.condition_tags)
  }
}

export default new ConditionTagWeb()
