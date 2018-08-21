import {pushRouteAndQueueCurrent} from '../../router'
import Form from "../../entities/trellis/Form";
export default abstract class CensusServiceAbstract {
  /**
   * Redirect to the census form of the type supplied
   * @param {String} studyId
   * @param {String} censusTypeId
   * @param {String} respondentId
   */
  redirectToCensusForm(studyId: string, censusTypeId: string, respondentId: string): void {
    pushRouteAndQueueCurrent({
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
   * @param {string} studyId
   * @param {string} censusTypeId
   * @returns {Promise<Form>}
   */
  abstract getCensusForm(studyId: string, censusTypeId: string): Promise<Form>

  /**
   * Check if the study has a census form for the given type
   * @param {string} studyId
   * @param {string} censusTypeId
   * @returns {Promise<boolean>}
   */
  abstract hasCensusForm (studyId: string, censusTypeId: string): Promise<boolean>

}

