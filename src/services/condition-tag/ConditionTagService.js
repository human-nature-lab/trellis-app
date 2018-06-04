import http from '../http/AxiosInstance'
export default class ConditionTagService {
  /**
   * Get all of the available condition tags
   * @returns {Array} - An array of condition tags
   */
  static respondent () {
    return http().get('/condition-tags/respondent').then(res => res.data.conditions)
  }
}
