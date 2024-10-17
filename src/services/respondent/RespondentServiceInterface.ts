import RespondentFill from '../../entities/trellis/RespondentFill'
import Respondent from '../../entities/trellis/Respondent'
import RespondentName from '../../entities/trellis/RespondentName'
import RespondentGeo from '../../entities/trellis/RespondentGeo'
import Photo from '../../entities/trellis/Photo'
import { RandomPagination, RandomPaginationResult } from '../../types/Pagination'
import PhotoWithPivotTable from '../../types/PhotoWithPivotTable'

export interface SearchFilter {
  conditionTags?: string[],    // Array of condition tag names to filter respondents by, logical AND
  orConditionTags?: string[],  // Array of condition tag names to union respondents by, logical OR
  geos?: string[]              // Array of geo ids
  onlyCurrentGeo?: boolean     // Indicates that only current residents should be included
  includeChildren?: boolean    // Indicates that nested respondents should be included
  randomize?: boolean          // Indicates that the respondents results should be randomized TODO: Web
}

export interface EdgeDatum {
  id: string
  source_respondent_id: string
  target_respondent_id: string
  var_name: string
}


export default interface RespondentServiceInterface {

  /**
   * Add a photo to this respondent
   * @param {string} respondentId
   * @param {Photo} photo
   * @returns {Promise<PhotoWithPivotTable>}
   */
  addPhoto (respondentId: string, photo: Photo): Promise<PhotoWithPivotTable>

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
   * Get multiple respondents using id
   * @param {string[]} respondentIds
   * @returns {Promise<Respondent[]>}
   */
  getRespondentsByIds (respondentIds: string[]): Promise<Respondent[]>

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
    pagination?: RandomPagination,
    respondentId?: string
  ): Promise<RandomPaginationResult<Respondent>>

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
  addRespondentGeo (respondentId: string, geoId: string, isCurrent: boolean): Promise<RespondentGeo>

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
   * @param respondentId
   * @param respondentGeoId
   * @param newGeoId
   * @returns Promise<RespondentGeo>
   */
  moveRespondentGeo (
    respondentId: string,
    respondentGeoId: string,
    newGeoId: string,
    isCurrent?: boolean,
    notes?: string): Promise<RespondentGeo>

  /**
   * Delete the respondent geo by id
   * @param {String} respondentId
   * @param {String} respondentGeoId
   * @returns {Promise<*>}
   */
  removeRespondentGeo (respondentId: string, respondentGeoId: string): Promise<void>

  /**
   * Delete the respondent
   * @param respondentId
   */
  removeRespondent (respondentId: string): Promise<void>

  /**
   * Upload a csv file of respondents that we can import
   * @param file
   * @param studyId
   */
  importRespondents (file: File, studyId: string): Promise<Respondent[]>

  /**
   * Import a zip file of respondent photos
   * @param file
   * @param studyId
   */
  importRespondentPhotos (file: File, studyId: string): Promise<object>

  /**
   * Import respondent locations from a csv file
   * @param file
   * @param studyId
   */
  importRespondentGeos (file: File, studyId: string): Promise<any>


  listEdges (respondentId: string): Promise<EdgeDatum[]>
}
