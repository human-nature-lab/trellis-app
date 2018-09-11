import http from '../http/AxiosInstance'
import GeoServiceInterface from './GeoServiceInterface'
import Geo from '../../entities/trellis/Geo'

export default class GeoServiceWeb implements GeoServiceInterface {

  getGeoById (geoId) {
    return this.getGeosById([geoId]).then(geoIds => geoIds[0])
  }

  getGeosById (geoIds) {
    geoIds = geoIds.map(g => encodeURIComponent(g))
    if (!geoIds.length) {
      return new Promise(resolve => resolve([]))
    }
    return http().get(`/geos/${geoIds.join(',')}`).then(res => {
      return res.data.geos.map(g => new Geo().fromSnakeJSON(g))
    })
  }

  getGeoAncestors (geoId) {
    geoId = encodeURIComponent(geoId)
    return http().get(`/geo/${geoId}/ancestors`).then(res => {
      return res.data.ancestors.map(g => new Geo().fromSnakeJSON(g))
    })
  }

  search (params) {
    if (params.types) {
      params.types = params.types.join(',')
    }
    return http().get('/geo/search', {
      params: params
    }).then(res => {
      return res.data.geos.map(g => new Geo().fromSnakeJSON(g))
    })
  }
}
