import Geo from "../../entities/trellis/Geo";

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

export default interface GeoServiceInterface {

  /**
   * Get a single geo object by id
   * @param geoId
   */
  getGeoById (geoId: string): Promise<Geo>

  /**
   * Get one or more geos by their ids
   * @param geoIds
   */
  getGeosById (geoIds: string[]): Promise<Geo[]>

  /**
   * Return an array of a geos ancestors in the correct order
   * @param {string} geoId
   */
  getGeoAncestors (geoId: string): Promise<Geo[]>

  /**
   * Run a query by the geo service with an object of parameters
   * @param {GeoSearchParams} params
   */
  search (params: GeoSearchParams): Promise<Geo[]>
}
