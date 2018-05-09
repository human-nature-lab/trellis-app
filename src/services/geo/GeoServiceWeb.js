import http from '../http/AxiosInstance'
export default class GeoServiceWeb {
  /**
   * Get one or more geos by their ids
   * @param {Array} geoIds - The geo ids to fetch
   */
  static getGeosById (geoIds) {
    if (!geoIds.length) {
      return new Promise(resolve => resolve([]))
    }
    return http().get(`/geos/${geoIds.join(',')}`).then(res => {
      return res.data.geos
    })
  }
}
