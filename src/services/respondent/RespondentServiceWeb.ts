import http from '../http/AxiosInstance'
import RespondentServiceInterface, {SearchFilter} from './RespondentServiceInterface'
import RespondentFill from '../../entities/trellis/RespondentFill'
import Respondent from '../../entities/trellis/Respondent'
import RespondentName from '../../entities/trellis/RespondentName'
import RespondentGeo from '../../entities/trellis/RespondentGeo'
import Photo from "../../entities/trellis/Photo";
import PhotoWithPivotTable from '../../types/PhotoWithPivotTable'
import RespondentPhoto from '../../entities/trellis/RespondentPhoto'
import {uriTemplate} from "../http/WebUtils";
export default class RespondentServiceWeb implements RespondentServiceInterface {

  async addPhoto (respondentId: string, photo: Photo): Promise<PhotoWithPivotTable> {
    throw new Error("Can't add respondent photo yet") // TODO: Respondent photo web
  }

  async updatePhotos (photos: Array<PhotoWithPivotTable>) {
    return http().post(`respondent-photos`, { photos: photos })
  }

  async removePhoto (photo: PhotoWithPivotTable) {
    return http().delete(uriTemplate('respondent-photos/{}', [photo.pivot.id]))
  }

  async getRespondentPhotos (respondentId: string): Promise<Array<PhotoWithPivotTable>> {
    let photos: PhotoWithPivotTable[]  = []
    let res = await http().get(uriTemplate('respondent/{}/photos', [respondentId]))
    for (let i = 0; i < res.data.photos.length; i++) {
      let respondentPhoto = new RespondentPhoto().fromSnakeJSON(res.data.photos[i])
      let photo = new Photo().fromSnakeJSON(res.data.photos[i].photo)
      respondentPhoto.photo = photo
      photos.push(new PhotoWithPivotTable(respondentPhoto))
    }

    return photos
  }

  async getRespondentFillsById (respondentId: string): Promise<RespondentFill[]> {
    let res = await http().get(uriTemplate('respondent/{}/fills', [respondentId]))
    return res.data.fills.map((f: object) => {
      return new RespondentFill().fromSnakeJSON(f)
    })
  }

  async getRespondentById (respondentId: string): Promise<Respondent> {
    let res = await http().get(uriTemplate('respondent/{}', [respondentId]))
    return new Respondent().fromSnakeJSON(res.data.respondent)
  }

  async getSearchPage (studyId: string, query: string, filters: SearchFilter, page = 0, size = 50, respondentId = null): Promise<Respondent[]> {
    // TODO: Add is_current filter
    let params = {
      q: query,
      offset: page * size,
      limit: size,
      associated_respondent_id: respondentId
    }
    if (filters.conditionTags) {
      params['c'] = filters.conditionTags.join(',')
    }
    if (filters.orConditionTags) {
      params['oc'] = filters.orConditionTags.join(',')
    }
    if (filters.geos) {
      params['g'] = filters.geos.join(',')
    }
    if (filters.includeChildren) {
      params['i'] = filters.includeChildren
    }
    if (filters.onlyCurrentGeo) {
      params['cg'] = filters.onlyCurrentGeo
    }
    if (filters.randomize) {
      params['r'] = filters.randomize
    }
    let res = await http().get(uriTemplate('study/{}/respondents/search', [studyId]), {
      params: params
    })
    return res.data.respondents.slice(0, size).map(r => {
      return new Respondent().fromSnakeJSON(r)
    })
  }
  async addName (respondentId, name, isDisplayName = null, localeId = null): Promise<RespondentName> {
    let res = await http().post(uriTemplate('respondent/{}/name', [respondentId]), {
      name: name,
      is_display_name: !!isDisplayName,
      locale_id: localeId
    })
    return new RespondentName().fromSnakeJSON(res.data.name)
  }
  editName (respondentId, respondentNameId, newName, isDisplayName = null, localeId = null): Promise<RespondentName> {
    return http().put(uriTemplate('respondent/{}/name/{}', [respondentId, respondentNameId]), {
      name: newName,
      is_display_name: isDisplayName,
      locale_id: localeId
    }).then(res => new RespondentName().fromSnakeJSON(res.data.name))
  }
  removeName (respondentId, respondentNameId): Promise<any> {
    return http().delete(uriTemplate('respondent/{}/name/{}', [respondentId, respondentNameId])).then(r => r.data)
  }
  createRespondent (studyId, name, geoId = null, associatedRespondentId = null) {
    return http().post(uriTemplate('study/{}/respondent', [studyId]), {
      name: name,
      geo_id: geoId,
      associated_respondent_id: associatedRespondentId
    }).then(res => new Respondent().fromSnakeJSON(res.data.respondent))
  }
  addRespondentGeo (respondentId: string, geoId: string, isCurrent: boolean): Promise<RespondentGeo> {
    return http().post(uriTemplate('respondent/{}/geo', [respondentId]), {
      geo_id: geoId,
      is_current: isCurrent // TODO: Handle this on the web side
    }).then(res => new RespondentGeo().fromSnakeJSON(res.data.geo))
  }
  editRespondentGeo (respondentId, respondentGeoId, isCurrent) {
    return http().put(uriTemplate('respondent/{}/geo/{}', [respondentId, respondentGeoId]), {
      is_current: isCurrent
    }).then(res => new RespondentGeo().fromSnakeJSON(res.data.respondent_geo))
  }
  moveRespondentGeo (respondentId: string, respondentGeoId: string, newGeoId: string, isCurrent?: boolean, notes?: string) {
    return http().post(uriTemplate('respondent/{}/geo/{}/move', [respondentId, respondentGeoId]), {
      new_geo_id: newGeoId,
      is_current: isCurrent,
      notes: notes
    }).then(res => {
      return new RespondentGeo().fromSnakeJSON(res.data.respondentGeo)
    })
  }
  removeRespondentGeo (respondentId, respondentGeoId) {
    return http().delete(uriTemplate('respondent/{}/geo/{}', [respondentId, respondentGeoId])).then(r => r.data)
  }
}
