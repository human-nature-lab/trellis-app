import Geo from '../../entities/trellis/Geo'
import Translation from '../../entities/trellis/Translation'
import Locale from '../../entities/trellis/Locale'
import TranslationText from '../../entities/trellis/TranslationText'
import GeoType from '../../entities/trellis/GeoType'
import GeoPhoto from '../../entities/trellis/GeoPhoto'
import Photo from '../../entities/trellis/Photo'
import PhotoWithPivotTable from '../../types/PhotoWithPivotTable'

export interface GeoSearchParams {
  query: string
  study: string
  types: string[] | string,
  parent: string,
  onlyNoParent: boolean,
  limit: number,
  offset: number
}

export default abstract class GeoServiceInterface {
  static DEFAULT_SEARCH_RESULTS_LIMIT = 50

  getDefaultSearchResultsLimit () {
    return GeoServiceInterface.DEFAULT_SEARCH_RESULTS_LIMIT
  }

  /**
   * Creates an in-memory Geo object to work with before persisting
   */
  createNewGeo (parentGeoId, locales: Locale[]): Geo {
    const geo = new Geo()
    geo.id = null
    geo.parentId = parentGeoId
    geo.latitude = null
    geo.longitude = null
    geo.altitude = 0
    geo.photos = []
    geo.nameTranslation = new Translation()
    geo.nameTranslation.translationText = []
    for (let i = 0; i < locales.length; i++) {
      let translationText = new TranslationText()
      translationText.localeId = locales[i].id
      translationText.locale = locales[i]
      translationText.translatedText = ''
      geo.nameTranslation.translationText.push(translationText)
    }
    return geo
  }

  /**
   * Create a new GeoPhoto for this geo
   * @param {string} geoId
   * @param {Photo} photo
   * @returns {Promise<GeoPhoto>}
   */
  abstract addPhoto (geoId: string, photo: Photo): PromiseLike<PhotoWithPivotTable>

  /**
   * Persist a Geo object to the database
   * @param {Geo} geo
   */
  abstract createGeo (geo: Geo): PromiseLike<any>

  /**
   * Gets an array of geo types by study ID and, optionally, filtered by user addable geo types
   * @param {string} studyId
   * @param {boolean} getUserAddable
   */
  abstract getGeoTypesByStudy (studyId: string, getUserAddable: boolean): PromiseLike<GeoType[]>

  /**
   * Get a single geo object by id
   * @param geoId
   */
  abstract getGeoById (geoId: string): PromiseLike<Geo>

  /**
   * Get one or more geos by their ids
   * @param geoIds
   */
  abstract getGeosById (geoIds: string[]): PromiseLike<Geo[]>

  /**
   * Return an array of a geos ancestors in the correct order
   * @param {string} geoId
   */
  abstract getGeoAncestors (geoId: string): PromiseLike<Geo[]>

  /**
   * Run a query by the geo service with an object of parameters
   * @param {GeoSearchParams} params
   */
  abstract search (studyId: string, params: GeoSearchParams): PromiseLike<Geo[]>

  /**
   * Get a list of child geos for this given parent
   * @param studyId
   * @param parentId
   */
  abstract getGeosByParentId (studyId: string, parentId: string): PromiseLike<Geo[]>

  /**
   * Import multiple geos simultaneously by uploading a CSV file.
   * @param studyId
   * @param file
   */
  abstract importGeos (studyId: string, file: File): PromiseLike<Geo[]>

  /**
   * Import multiple photos and assign them to photos by uploading a ZIP file.
   * @param studyId
   * @param file
   */
  abstract importGeoPhotos (studyId: string, file: File): PromiseLike<void>
}
