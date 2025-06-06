import { RandomPagination, RandomPaginationResult } from '../../types/Pagination'
import http, { adminInst } from '../http/AxiosInstance'
import RespondentServiceInterface, { SearchFilter, EdgeDatum } from './RespondentServiceInterface'
import RespondentFill from '../../entities/trellis/RespondentFill'
import Respondent from '../../entities/trellis/Respondent'
import RespondentName from '../../entities/trellis/RespondentName'
import RespondentGeo from '../../entities/trellis/RespondentGeo'
import Photo from '../../entities/trellis/Photo'
import PhotoWithPivotTable from '../../types/PhotoWithPivotTable'
import RespondentPhoto from '../../entities/trellis/RespondentPhoto'
import { uriTemplate } from '../http/WebUtils'
export class RespondentService implements RespondentServiceInterface {
  async addPhoto (respondentId: string, photo: Photo): Promise<PhotoWithPivotTable> {
    throw new Error("Can't add respondent photo yet") // TODO: Respondent photo web
  }

  async updatePhotos (photos: Array<PhotoWithPivotTable>) {
    return http().post('respondent-photos', { photos: photos })
  }

  async removePhoto (photo: PhotoWithPivotTable) {
    return http().delete(uriTemplate('respondent-photos/{}', [photo.pivot.id]))
  }

  async getRespondentPhotos (respondentId: string): Promise<Array<PhotoWithPivotTable>> {
    const photos: PhotoWithPivotTable[] = []
    const res = await http().get(uriTemplate('respondent/{respondentId}/photos', [respondentId]))
    for (let i = 0; i < res.data.photos.length; i++) {
      const respondentPhoto = new RespondentPhoto().fromSnakeJSON(res.data.photos[i])
      respondentPhoto.photo = new Photo().fromSnakeJSON(res.data.photos[i].photo)
      photos.push(new PhotoWithPivotTable(respondentPhoto))
    }
    return photos
  }

  async getRespondentFillsById (respondentId: string): Promise<RespondentFill[]> {
    const res = await http().get(uriTemplate('respondent/{}/fills', [respondentId]))
    return res.data.fills.map((f: object) => {
      return new RespondentFill().fromSnakeJSON(f)
    })
  }

  async getRespondentById (respondentId: string): Promise<Respondent> {
    const res = await http().get(uriTemplate('respondent/{}', [respondentId]))
    return new Respondent().fromSnakeJSON(res.data.respondent)
  }

  async getRespondentsByIds (respondentIds: string[]): Promise<Respondent[]> {
    const res = await http().get('respondents', {
      params: {
        ids: respondentIds,
      },
    })
    return res.data.respondents.map(r => new Respondent().fromSnakeJSON(r))
  }

  async getSearchPage (studyId: string, query: string, filters: SearchFilter, pagination: RandomPagination, respondentId = null): Promise<RandomPaginationResult<Respondent>> {
    // TODO: Add is_current filter
    const params = {
      q: query,
      page: pagination.page,
      size: pagination.size,
      seed: pagination.seed,
      associated_respondent_id: respondentId,
    }
    if (filters.conditionTags) {
      params.c = filters.conditionTags.join(',')
    }
    if (filters.orConditionTags) {
      params.oc = filters.orConditionTags.join(',')
    }
    if (filters.geos) {
      params.g = filters.geos.join(',')
    }
    if (filters.includeChildren) {
      params.i = filters.includeChildren
    }
    if (filters.onlyCurrentGeo) {
      params.cg = filters.onlyCurrentGeo
    }
    if (filters.randomize) {
      params.r = filters.randomize
    }
    const res = await http().get(uriTemplate('study/{studyId}/respondents/search', [studyId]), { params })
    return {
      page: res.data.page,
      size: res.data.size,
      total: res.data.total,
      seed: res.data.seed,
      data: res.data.data.map(r => new Respondent().fromSnakeJSON(r)),
    }
  }

  async addName (respondentId, name, isDisplayName = null, localeId = null): Promise<RespondentName> {
    const res = await http().post(uriTemplate('respondent/{}/name', [respondentId]), {
      name: name,
      is_display_name: !!isDisplayName,
      locale_id: localeId,
    })
    return new RespondentName().fromSnakeJSON(res.data.name)
  }

  editName (respondentId, respondentNameId, newName, isDisplayName = null, localeId = null): Promise<RespondentName> {
    return http().put(uriTemplate('respondent/{}/name/{}', [respondentId, respondentNameId]), {
      name: newName,
      is_display_name: isDisplayName,
      locale_id: localeId,
    }).then(res => new RespondentName().fromSnakeJSON(res.data.name))
  }

  removeName (respondentId, respondentNameId): Promise<any> {
    return http().delete(uriTemplate('respondent/{}/name/{}', [respondentId, respondentNameId])).then(r => r.data)
  }

  createRespondent (studyId, name, geoId = null, associatedRespondentId = null) {
    return http().post(uriTemplate('study/{}/respondent', [studyId]), {
      name: name,
      geo_id: geoId,
      associated_respondent_id: associatedRespondentId,
    }).then(res => new Respondent().fromSnakeJSON(res.data.respondent))
  }

  addRespondentGeo (respondentId: string, geoId: string, isCurrent: boolean): Promise<RespondentGeo> {
    return http().post(uriTemplate('respondent/{}/geo', [respondentId]), {
      geo_id: geoId,
      is_current: isCurrent, // TODO: Handle this on the web side
    }).then(res => new RespondentGeo().fromSnakeJSON(res.data.geo))
  }

  editRespondentGeo (respondentId, respondentGeoId, isCurrent) {
    return http().put(uriTemplate('respondent/{}/geo/{}', [respondentId, respondentGeoId]), {
      is_current: isCurrent,
    }).then(res => new RespondentGeo().fromSnakeJSON(res.data.respondent_geo))
  }

  moveRespondentGeo (respondentId: string, respondentGeoId: string, newGeoId: string, isCurrent?: boolean, notes?: string) {
    return http().post(uriTemplate('respondent/{}/geo/{}/move', [respondentId, respondentGeoId]), {
      new_geo_id: newGeoId,
      is_current: isCurrent,
      notes: notes,
    }).then(res => {
      return new RespondentGeo().fromSnakeJSON(res.data.respondentGeo)
    })
  }

  removeRespondentGeo (respondentId, respondentGeoId) {
    return http().delete(uriTemplate('respondent/{rid}/geo/{rgid}', [respondentId, respondentGeoId])).then(r => r.data)
  }

  async removeRespondent (respondentId: string): Promise<void> {
    const res = await adminInst.delete(uriTemplate('respondent/{id}', [respondentId]))
  }

  async importRespondents (file: File, studyId: string): Promise<Respondent[]> {
    const formData = new FormData()
    formData.append('file', file)
    const res = await adminInst.post(uriTemplate('study/{studyId}/respondent/import', [studyId]), formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return res.data.respondents.map(r => new Respondent().fromSnakeJSON(r))
  }

  async importRespondentPhotos (file: File, studyId: string): Promise<void> {
    const formData = new FormData()
    formData.append('file', file)
    await adminInst.post(uriTemplate('study/{studyId}/respondent-photo/import', [studyId]), formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  }

  async importRespondentGeos (file: File, studyId: string): Promise<any> {
    const formData = new FormData()
    formData.append('file', file)
    await adminInst.post(uriTemplate('study/{studyId}/respondent-geo/import', [studyId]), formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  }

  async listEdges (respondentId: string) {
    const res = await adminInst.get(uriTemplate('respondent/{respondentId}/edges', [respondentId]))
    return res.data as EdgeDatum[]
  }
}
