import Geo from '../../entities/trellis/Geo'
import Translation from '../../entities/trellis/Translation'
import Locale from '../../entities/trellis/Locale'
import TranslationText from '../../entities/trellis/TranslationText'
import GeoType from '../../entities/trellis/GeoType'
import GeoPhoto from "../../entities/trellis/GeoPhoto";
import Photo from "../../entities/trellis/Photo";

export abstract class GeoSearchParams {
  constructor (
    public query: string,
    public studyId: string,
    public typeIds: string[] = [],
    public parentId: string = null,
    public onlyNoParent: boolean = false,
    public limit: number = 25,
    public offset: number = 0
  ) {}
}

export default abstract class GeoServiceInterface {

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
  abstract addPhoto (geoId: string, photo: Photo): Promise<GeoPhoto>

  /**
   * Persist a Geo object to the database
   * @param {Geo} geo
   */
  abstract createGeo (geo: Geo): Promise<any>

  /**
   * Gets an array of geo types by study ID and, optionally, filtered by user addable geo types
   * @param {string} studyId
   * @param {boolean} getUserAddable
   */
  abstract getGeoTypesByStudy (studyId: string, getUserAddable: boolean): Promise<GeoType[]>

  /**
   * Get a single geo object by id
   * @param geoId
   */
  abstract getGeoById (geoId: string): Promise<Geo>

  /**
   * Get one or more geos by their ids
   * @param geoIds
   */
  abstract getGeosById (geoIds: string[]): Promise<Geo[]>

  /**
   * Return an array of a geos ancestors in the correct order
   * @param {string} geoId
   */
  abstract getGeoAncestors (geoId: string): Promise<Geo[]>

  /**
   * Run a query by the geo service with an object of parameters
   * @param {GeoSearchParams} params
   */
  abstract search (params: GeoSearchParams): Promise<Geo[]>
}
