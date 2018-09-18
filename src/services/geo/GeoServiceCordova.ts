import DatabaseService from '../database/DatabaseService'
import GeoServiceInterface from './GeoServiceInterface'
import Geo from '../../entities/trellis/Geo'
import {In, IsNull} from 'typeorm'

export default class GeoServiceCordova implements GeoServiceInterface {

  async getGeoById (geoId) {
    const repository = await DatabaseService.getRepository(Geo)
    return await repository.findOne({
      where: {
        deletedAt: null,
        id: geoId
      },
      relations: ['geoType', 'photos', 'nameTranslation']
    })
  }

  async getGeosById (geoIds) {
    const repository = await DatabaseService.getRepository(Geo)
    return await repository.find({
      where: {
        deletedAt: IsNull(),
        id: In(geoIds)
      },
      relations: ['geoType', 'photos', 'nameTranslation']
    })
  }

  async removeGeo (geoId) {
    const repository = await DatabaseService.getRepository(Geo)
    return repository.update({id: geoId}, {deletedAt: new Date()})
  }

  async moveGeo (geoId, latitude, longitude, moveChildren) {
    // TODO
    throw new Error("Unimplemented!")
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
    const query = (params.hasOwnProperty('query')) ? params.query : null
    const limit = (params.hasOwnProperty('limit')) ? params.limit : 25
    const offset = (params.hasOwnProperty('offset')) ? params.offset : 0
    const studyId = (params.hasOwnProperty('study')) ? params.study : null
    const parentGeoId = (params.hasOwnProperty('parent')) ? params.parent : null
    const onlyNoParent = params.hasOwnProperty('no-parent')
    if (onlyNoParent) {
      console.log('no-parent', params['no-parent'])
    }
    const geoTypeIds =  (params.hasOwnProperty('types')) ? params.types : null

    const connection = await DatabaseService.getDatabase()
    const repository = await connection.getRepository(Geo)
    const queryBuilder = await repository.createQueryBuilder('geo')
    let q = queryBuilder.where('"geo"."deleted_at" is null')

    if (studyId !== null) {
      q = q.andWhere('"geo"."geo_type_id" in (select id from geo_type where study_id = :studyId)', {studyId: studyId})
    }

    if (parentGeoId !== null) {
      q = q.andWhere('"geo"."parent_id" = :parentGeoId', {parentGeoId: parentGeoId})
    }

    if (parentGeoId === null && onlyNoParent) {
      console.log('onlyNoParent', onlyNoParent)
      q = q.andWhere('"geo"."parent_id" is null')
    }

    if (geoTypeIds !== null) {
      let geoTypeIdString = geoTypeIds.map((geoTypeId) => { return '"' + geoTypeId + '"' }).join(',')
      q = q.andWhere('"geo"."geo_type_id" in (:geoTypeIdString)', {geoTypeIdString: geoTypeIdString})
    }

    if (typeof query === 'string' && query.trim().length > 0) {
      const searchTerms = query.split(' ')
      console.log('searchTerms', searchTerms)
      for (let i = 0; i < searchTerms.length; i++) {
        let searchTerm = '%' + searchTerms[i].trim() + '%'
        q = q.andWhere(`"geo"."name_translation_id" in (select translation_id from translation_text where translated_text like :searchTerm${i})`, {[`searchTerm${i}`]: searchTerm})
      }
    }

    q = q.limit(limit).offset(offset)
      .leftJoinAndSelect('geo.geoType', 'geo_type')
      .leftJoinAndSelect('geo.photos', 'photos')
      .leftJoinAndSelect('geo.nameTranslation', 'translation')
      .leftJoinAndSelect('translation.translationText', 'translation_text')
    return await q.getMany()
  }
}
