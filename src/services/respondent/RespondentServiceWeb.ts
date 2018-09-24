import http from '../http/AxiosInstance'
import RespondentServiceInterface from './RespondentServiceInterface'
import RespondentFill from '../../entities/trellis/RespondentFill'
import Respondent from '../../entities/trellis/Respondent'
import RespondentName from '../../entities/trellis/RespondentName'
import RespondentGeo from '../../entities/trellis/RespondentGeo'
export default class RespondentServiceWeb implements RespondentServiceInterface {

  async getRespondentFillsById (respondentId: string): Promise<RespondentFill[]> {
    respondentId = encodeURIComponent(respondentId)
    let res = await http().get(`respondent/${respondentId}/fills`)
    return res.data.fills.map((f: object) => {
      return new RespondentFill().fromSnakeJSON(f)
    })
  }
  async getRespondentById (respondentId: string): Promise<Respondent> {
    respondentId = encodeURIComponent(respondentId)
    let res = await http().get(`respondent/${respondentId}`)
    return new Respondent().fromSnakeJSON(res.data.respondent)
  }
  async getSearchPage (studyId: string, query: string, filters, page = 0, size = 50, respondentId = null): Promise<Respondent[]> {
    let params = {
      q: query,
      offset: page * size,
      limit: size,
      associated_respondent_id: respondentId
    }
    if (filters.conditionTags) {
      params['c'] = filters.conditionTags.join(',')
    }
    if (filters.geos) {
      params['g'] = filters.geos.join(',')
    }
    if (filters.include_children) {
      params['i'] = filters.include_children
    }
    studyId = encodeURIComponent(studyId)
    let res = await http().get(`study/${studyId}/respondents/search`, {
      params: params
    })
    return res.data.respondents.slice(0, size).map(r => {
      return new Respondent().fromSnakeJSON(r)
    })
  }
  async addName (respondentId, name, isDisplayName = null, localeId = null): Promise<RespondentName> {
    respondentId = encodeURIComponent(respondentId)
    let res = await http().post(`respondent/${respondentId}/name`, {
      name: name,
      is_display_name: !!isDisplayName,
      locale_id: localeId
    })
    return new RespondentName().fromSnakeJSON(res.data.name)
  }
  editName (respondentId, respondentNameId, newName, isDisplayName = null, localeId = null): Promise<RespondentName> {
    respondentId = encodeURIComponent(respondentId)
    respondentNameId = encodeURIComponent(respondentNameId)
    return http().put(`respondent/${respondentId}/name/${respondentNameId}`, {
      name: newName,
      is_display_name: isDisplayName,
      locale_id: localeId
    }).then(res => new RespondentName().fromSnakeJSON(res.data.name))
  }
  removeName (respondentId, respondentNameId): Promise<any> {
    respondentId = encodeURIComponent(respondentId)
    respondentNameId = encodeURIComponent(respondentNameId)
    return http().delete(`respondent/${respondentId}/name/${respondentNameId}`).then(r => r.data)
  }
  createRespondent (studyId, name, geoId = null, associatedRespondentId = null) {
    return http().post(`study/${studyId}/respondent`, {
      name: name,
      geo_id: geoId,
      associated_respondent_id: associatedRespondentId
    }).then(res => new Respondent().fromSnakeJSON(res.data.respondent))
  }
  addRespondentGeo (respondentId: string, geoId: string): Promise<RespondentGeo> {
    respondentId = encodeURIComponent(respondentId)
    geoId = encodeURIComponent(geoId)
    return http().post(`respondent/${respondentId}/geo`, {
      geo_id: geoId
    }).then(res => new RespondentGeo().fromSnakeJSON(res.data.geo))
  }
  editRespondentGeo (respondentId, respondentGeoId, isCurrent) {
    respondentId = encodeURIComponent(respondentId)
    respondentGeoId = encodeURIComponent(respondentGeoId)
    return http().put(`respondent/${respondentId}/geo/${respondentGeoId}`, {
      is_current: isCurrent
    }).then(res => new RespondentGeo().fromSnakeJSON(res.data.respondent_geo))
  }
  moveRespondentGeo (respondentId, respondentGeoId, newGeoId) {
    respondentId = encodeURIComponent(respondentId)
    respondentGeoId = encodeURIComponent(respondentGeoId)
    return http().post(`respondent/${respondentId}/geo/${respondentGeoId}/move`, {
      new_geo_id: newGeoId
    }).then(res => new RespondentGeo().fromSnakeJSON(res.data.geo))
  }
  removeRespondentGeo (respondentId, respondentGeoId) {
    respondentId = encodeURIComponent(respondentId)
    respondentGeoId = encodeURIComponent(respondentGeoId)
    return http().delete(`respondent/${respondentId}/geo/${respondentGeoId}`).then(r => r.data)
  }
}
