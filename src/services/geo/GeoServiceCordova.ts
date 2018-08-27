import DatabaseService from '../database/DatabaseService'
import GeoServiceInterface from './GeoServiceInterface'
import Geo from '../../entities/trellis/Geo'
import { In } from 'typeorm'

export class GeoServiceCordova implements GeoServiceInterface {

  async getGeoById (geoId) {
    const connection = await DatabaseService.getDatabase()
    const repository = await connection.getRepository(Geo)
    return await repository.findOne({ deletedAt: null, id: geoId })
  }

  async getGeosById (geoIds) {
    const connection = await DatabaseService.getDatabase()
    const repository = await connection.getRepository(Geo)
    return await repository.find({
      deletedAt: null,
      id: In(geoIds)
    })
  }

  async getGeoAncestors (geoId) {
    let currentGeoId = geoId
    let count = 0
    let ancestorIds = {}
    let ancestors = []
    while (currentGeoId !== null && !ancestors.hasOwnProperty(currentGeoId) && count < 25) {
      let geo = await this.getGeoById(currentGeoId)
      ancestors.push(geo)
      ancestorIds[geoId] = true
      currentGeoId = geo.parentId
      count++
    }
    return ancestors
  }

  async search (params) {
    const connection = await DatabaseService.getDatabase()
    const repository = await connection.getRepository(Geo)
    return await repository.findOne({ deletedAt: null })
    /* TODO:
    if (params.types) {
      params.types = params.types.join(',')
    }
    return http().get('/geo/search', {
      params: params
    }).then(res => {
      return res.data.geos.map(g => new Geo().fromSnakeJSON(g))
    })
    */
  }
}


export default new GeoServiceCordova()
