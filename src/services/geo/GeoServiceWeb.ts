import http from '../http/AxiosInstance'
import GeoServiceAbstract from './GeoServiceAbstract'
import Geo from '../../entities/trellis/Geo'
import GeoType from '../../entities/trellis/GeoType'

export default class GeoServiceWeb extends GeoServiceAbstract {

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

  async createGeo (geo: Geo): Promise<any> {
    console.log('createGeo', geo)
    return http().put('/geo', {
      geo: geo
    })
  }

  async getGeoTypesByStudy (studyId: string, getUserAddable: boolean): Promise<GeoType[]> {
    let res = await http().get(`/geo-types`, {
      params: {
        study_id: studyId,
        get_user_addable: getUserAddable
      }
    })
    return res.data.geoTypes.map((geoType) => {
      return new GeoType().fromSnakeJSON(geoType)
    })
  }

  async removeGeo (geoId) {
    return http().delete(`/geo/${geoId}`)
  }

  async moveGeo (geoId, latitude, longitude, moveChildren) {
    return http().post(`/geo/${geoId}/move`, {
      latitude: latitude,
      longitude: longitude,
      moveChildren: moveChildren
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
