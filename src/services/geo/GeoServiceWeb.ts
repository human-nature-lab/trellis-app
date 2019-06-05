import Study from '../../entities/trellis/Study'
import http, { adminInst } from '../http/AxiosInstance'
import {uriTemplate} from "../http/WebUtils";
import GeoServiceAbstract from './GeoServiceAbstract'
import Geo from '../../entities/trellis/Geo'
import GeoType from '../../entities/trellis/GeoType'
import Photo from "../../entities/trellis/Photo";
import PhotoWithPivotTable from '../../types/PhotoWithPivotTable'
import GeoPhoto from '../../entities/trellis/GeoPhoto'

export default class GeoServiceWeb extends GeoServiceAbstract {

  async addPhoto (geoId: string, photo: Photo): Promise<PhotoWithPivotTable> {
    // TODO: Add geo photo on web side
    throw new Error("Can't add photos on web side yet")
  }

  async updatePhotos (photos: Array<PhotoWithPivotTable>) {
    return http().post(`geo-photos`, { photos: photos })
  }

  async removePhoto (photo: PhotoWithPivotTable) {
    let geoPhotoId = encodeURIComponent(photo.pivot.id)
    return http().delete(`geo-photo/${geoPhotoId}`)
  }

  async getGeoPhotos (geoId: string): Promise<Array<PhotoWithPivotTable>> {
    let photos: PhotoWithPivotTable[]  = []
    geoId = encodeURIComponent(geoId)
    let res = await http().get(`geo/${geoId}/photos`)
    for (let i = 0; i < res.data.photos.length; i++) {
      let geoPhoto = new GeoPhoto().fromSnakeJSON(res.data.photos[i])
      let photo = new Photo().fromSnakeJSON(res.data.photos[i].photo)
      geoPhoto.photo = photo
      photos.push(new PhotoWithPivotTable(geoPhoto))
    }

    return photos
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

  async createGeo (geo: Geo): Promise<any> {
    return http().put('/geo', {
      geo: geo
    })
  }

  async updateGeo (geo: Geo) {
    return http().post(`/geo/${geo.id}`, {
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
}
