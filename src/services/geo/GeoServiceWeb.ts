import http, { adminInst } from '../http/AxiosInstance'
import { uriTemplate } from '../http/WebUtils'
import GeoServiceAbstract, { GeoSearchParams } from './GeoServiceAbstract'
import Geo from '../../entities/trellis/Geo'
import GeoType from '../../entities/trellis/GeoType'
import Photo from '../../entities/trellis/Photo'
import PhotoWithPivotTable from '../../types/PhotoWithPivotTable'
import GeoPhoto from '../../entities/trellis/GeoPhoto'

export default class GeoServiceWeb extends GeoServiceAbstract {

  async addPhoto (geoId: string, photo: Photo): Promise<PhotoWithPivotTable> {
    // TODO: Add geo photo on web side
    throw new Error(`Can't add photos on web side yet`)
  }

  updatePhotos (photos: Array<PhotoWithPivotTable>): Promise<any> {
    return http().post('geo-photos', { photos: photos })
  }

  removePhoto (photo: PhotoWithPivotTable): Promise<any> {
    return http().delete(uriTemplate('geo-photo/{geoPhotoId}', [photo.pivot.id]))
  }

  async getGeoPhotos (geoId: string): Promise<Array<PhotoWithPivotTable>> {
    const res = await http().get(uriTemplate('geo/{geoId}/photos', [geoId]))
    return res.data.photos.map(p => {
      const geoPhoto = new GeoPhoto().fromSnakeJSON(p)
      geoPhoto.photo = new Photo().fromSnakeJSON(p.photo)
      return new PhotoWithPivotTable(geoPhoto)
    })
  }

  getGeoById (geoId) {
    return this.getGeosById([geoId]).then(geoIds => geoIds[0])
  }

  async getGeosById (geoIds: string[]): Promise<Geo[]> {
    geoIds = geoIds.map(g => encodeURIComponent(g))
    if (!geoIds.length) {
      return []
    }
    const res = await http().get(`/geos/${geoIds.join(',')}`)
    return res.data.geos.map(g => new Geo().fromSnakeJSON(g))
  }

  async getGeosByParentId (studyId: string, parentId: string): Promise<Geo[]> {
    const res = await http().get(uriTemplate(`study/{studyId}/geos/parent/{parentId}`, [studyId, parentId]))
    return res.data.geos.map(g => new Geo().fromSnakeJSON(g))
  }

  createGeo (geo: Geo): Promise<any> {
    return http().put('/geo', {
      geo: geo
    })
  }

  updateGeo (geo: Geo): Promise<any> {
    return http().post(uriTemplate('/geo/{geo}', [geo.id]), {
      'geo_type_id' : geo.geoTypeId,
      'parent_id' : geo.parentId,
      'latitude' : geo.latitude,
      'longitude' : geo.longitude,
      'altitude' : geo.altitude,
      'name_translation_id' : geo.nameTranslationId
    })
  }

  async getGeoTypesByStudy (studyId: string, getUserAddable: boolean): Promise<GeoType[]> {
    let res = await http().get(`/geo-types`, {
      params: {
        study_id: studyId,
        get_user_addable: getUserAddable
      }
    })
    return res.data.geoTypes.map((geoType) => new GeoType().fromSnakeJSON(geoType))
  }

  async removeGeo (geoId: string): Promise<any> {
    return http().delete(uriTemplate('/geo/{geoId}', [geoId]))
  }

  async moveGeo (geoId, latitude, longitude, moveChildren) {
    return http().post(uriTemplate('/geo/{geoId}/move', [geoId]), {
      latitude: latitude,
      longitude: longitude,
      moveChildren: moveChildren
    })
  }

  async getGeoAncestors (geoId: string): Promise<Geo[]> {
    const res = await http().get(uriTemplate('/geo/{geoId}/ancestors', [geoId]))
    return res.data.ancestors.map(g => new Geo().fromSnakeJSON(g))
  }

  async search (studyId: string, params: GeoSearchParams): Promise<Geo[]> {
    if (params.types && Array.isArray(params.types)) {
      params.types = params.types.join(',')
    }
    params.study = studyId
    const res = await http().get('/geo/search', {
      params: params
    })
    return res.data.geos.map(g => new Geo().fromSnakeJSON(g))
  }

  async importGeos (studyId: string, file: File): Promise<Geo[]> {
    const formData = new FormData()
    formData.append('file', file)
    const res = await adminInst.post(uriTemplate('study/{studyId}/geo/import', [studyId]), formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return res.data.geos.map(r => new Geo().fromSnakeJSON(r))
  }

  async importGeoPhotos (studyId: string, file: File): Promise<any> {
    const formData = new FormData()
    formData.append('file', file)
    const res = await adminInst.post(uriTemplate('study/{studyId}/geo-photo/import', [studyId]), formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return res.data
  }

}
