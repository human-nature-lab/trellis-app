import http from '../http/AxiosInstance'
import router from '../../router'
export default class CensusServiceWeb {

  /**
   * Redirect to the census form of the type supplied
   * @param {String} studyId
   * @param {String} censusTypeId
   * @param {String} respondentId
   */
  static redirectToCensusForm (studyId, censusTypeId, respondentId) {
    router.push({
      name: 'StartCensusForm',
      params: {
        studyId: studyId,
        censusTypeId: censusTypeId
      },
      query: {
        respondentId: respondentId
      }
    })
  }

  /**
   * Get the census form of the specified study if there is one
   * @param studyId
   * @param censusTypeId
   * @returns {*}
   */
  static getCensusForm (studyId, censusTypeId) {
    return http().get(`study/${studyId}/form/census`, {
      params: {
        census_type: censusTypeId
      }
    }).then(res => res.data.form)
  }

  /**
   * Check if the study has a census form for the given type
   * @param studyId
   * @param censusTypeId
   * @returns {*}
   */
  static hasCensusForm (studyId, censusTypeId) {
    return CensusServiceWeb.getCensusForm(studyId, censusTypeId)
      .then(form => form ? true : false) // eslint-disable-line
  }

}
