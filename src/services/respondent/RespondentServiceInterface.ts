import RespondentFill from "../../entities/trellis/RespondentFill";
import Respondent from "../../entities/trellis/Respondent";
import RespondentName from "../../entities/trellis/RespondentName";
import RespondentGeo from "../../entities/trellis/RespondentGeo";
import Geo from "../../entities/trellis/Geo";

export interface SearchFilter {
  conditionTags: string[], // Array of condition tag names
  geos: string[] // Array of geo ids
}

export default interface RespondentServiceInterface {

  /**
   * Get the fills for this respondent by respondent id
   * @param {string} respondentId
   * @returns {Promise<RespondentFill[]>}
   */
  getRespondentFillsById (respondentId: string): Promise<RespondentFill[]>

  /**
   * Get a respondent by id
   * @param {string} respondentId
   * @returns {Promise<Respondent[]>}
   */
  getRespondentById (respondentId: string): Promise<Respondent>

  /**
   * Get the results of a search query
   * @param {string} studyId
   * @param {string} query
   * @param {SearchFilter} filters
   * @param {number} page
   * @param {number} size
   * @param respondentId
   * @returns {Promise<Respondent[]>}
   */
  getSearchPage (
    studyId: string,
    query: string,
    filters: SearchFilter,
    page?: number,
    size?: number,
    respondentId?
  ): Promise<Respondent[]>

  /**
   * Add a name to the respondent
   * @param {string} respondentId
   * @param {string} name
   * @param {boolean} [isDisplayName]
   * @param {string} [localeId]
   * @returns {*}
   */
  addName (
    respondentId: string,
    name: string,
    isDisplayName?: boolean,
    localeId?:string
  ): Promise<RespondentName>

  /**
   * Modify a respondent name
   * @param {string} respondentId
   * @param {string} respondentNameId
   * @param {string} newName
   * @param {boolean} [isDisplayName]
   * @param {string} [localeId]
   * @returns {Promise<Object>}
   */
  editName (
    respondentId: string,
    respondentNameId: string,
    newName: string,
    isDisplayName?: boolean,
    localeId?: string
  ): Promise<RespondentName>

  /**
   * Delete a respondent name
   * @param {string} respondentId
   * @param {string} respondentNameId
   * @returns {Promise<Object>}
   */
  removeName (respondentId: string, respondentNameId: string): Promise<void>

  /**
   * Add a new respondent. Can optionally be associated with another respondent
   * @param {String} studyId
   * @param {String} name
   * @param {String} [geoId]
   * @param {String} [associatedRespondentId] - Add this argument if you want the added respondent to only be visible in
   * surveys being conducted for the associated respondent.
   */
  createRespondent (
    studyId: string,
    name: string,
    geoId?: string,
    associatedRespondentId?: string
  ): Promise<Respondent>

  /**
   * Add a geo to the respondent
   * @param {String} respondentId
   * @param {String} geoId
   * @returns {Promise<Object>}
   */
  addRespondentGeo (respondentId: string, geoId: string): Promise<RespondentGeo>

  /**
   * Edit the respondent geo (change is current)
   * @param {String} respondentId
   * @param {String} respondentGeoId
   * @param {String} isCurrent
   * @returns {Promise<Object>}
   */
  editRespondentGeo (respondentId: string, respondentGeoId: string, isCurrent: boolean): Promise<RespondentGeo>

  /**
   * Move a respondent geo to another location
   * @param {String} respondentId
   * @param {String} respondentGeoId
   * @param {String} newGeoId
   * @returns {Promise<Object>}
   */
  moveRespondentGeo (respondentId: string, respondentGeoId: string, newGeoId: string): Promise<Geo>

  /**
   * Delete the respondent geo by id
   * @param {String} respondentId
   * @param {String} respondentGeoId
   * @returns {Promise<*>}
   */
  removeRespondentGeo (respondentId: string, respondentGeoId: string): Promise<void>
}