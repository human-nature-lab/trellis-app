import DatabaseService from '../database/DatabaseService'
import GeoServiceAbstract from './GeoServiceAbstract'
import Geo from '../../entities/trellis/Geo'
import {In, IsNull} from 'typeorm'
import GeoType from '../../entities/trellis/GeoType'
import uuid from 'uuid/v4'
import GeoPhoto from "../../entities/trellis/GeoPhoto";
import Photo from "../../entities/trellis/Photo";

export default class GeoServiceCordova extends GeoServiceAbstract {

  async addPhoto (geoId: string, photo: Photo): Promise<GeoPhoto> {
    const repo = await DatabaseService.getRepository(GeoPhoto)
    let gPhoto = new GeoPhoto()
    gPhoto.photoId = photo.id
    gPhoto.geoId = geoId
    gPhoto.sortOrder = await repo.createQueryBuilder('gp').where('gp.geoId = :geoId', {geoId}).getCount()
    await repo.save(gPhoto)
    return gPhoto
  }

  async getGeoById (geoId) {
    const repository = await DatabaseService.getRepository(Geo)
    return repository.findOne({
      where: {
        deletedAt: IsNull(),
        id: geoId
      },
      relations: ['geoType', 'photos', 'nameTranslation', 'nameTranslation.translationText']
    })
  }

  async getGeosByParentId (parentId) {
    const repository = await DatabaseService.getRepository(Geo)
    return repository.find({
      where: {
        deletedAt: IsNull(),
        parentId: parentId
      },
      relations: ['geoType', 'photos', 'nameTranslation', 'nameTranslation.translationText']
    })
  }

  async createGeo (geo: Geo): Promise<Geo> {
    const connection = await DatabaseService.getDatabase()
    geo.id = uuid()
    await connection.transaction(async manager => {
      geo.nameTranslation.id = uuid()
      manager.save(geo.nameTranslation)

      for (let i = 0; i < geo.nameTranslation.translationText.length; i++) {
        let translationText = geo.nameTranslation.translationText[i]
        translationText.id = uuid()
        translationText.translation = geo.nameTranslation
        await manager.save(translationText)
      }

      manager.save(geo)
    })
    return this.getGeoById(geo.id)
  }

  async getGeoTypesByStudy (studyId: string, getUserAddable: boolean): Promise<GeoType[]> {
    const connection = await DatabaseService.getDatabase()
    const repository = await connection.getRepository(GeoType)
    const queryBuilder = await repository.createQueryBuilder('geo_type')
    let q = queryBuilder.where('"geo_type"."deleted_at" is null')

    if (studyId !== null) {
      q = q.andWhere('"study_id" = :studyId', {studyId: studyId})
    }

    if (getUserAddable !== null) {
      q = q.andWhere('"can_user_add" = 1')
    }

    return q.getMany()
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
    const connection = await DatabaseService.getDatabase()
    let q = await connection.createQueryBuilder()

    q = q.update(Geo)
      .set({ latitude: latitude, longitude: longitude })
      .where("id = :id", { id: geoId })

    if (moveChildren) {
      q = q.orWhere("parent_id = :id", { id: geoId })
    }

    return q.execute()
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
      q = q.andWhere('"geo"."parent_id" is null')
    }

    if (geoTypeIds !== null) {
      let geoTypeIdString = geoTypeIds.map((geoTypeId) => { return '"' + geoTypeId + '"' }).join(',')
      q = q.andWhere('"geo"."geo_type_id" in (:geoTypeIdString)', {geoTypeIdString: geoTypeIdString})
    }

    if (typeof query === 'string' && query.trim().length > 0) {
      const searchTerms = query.split(' ')
      for (let i = 0; i < searchTerms.length; i++) {
        let searchTerm = '%' + searchTerms[i].trim() + '%'
        q = q.andWhere(`"geo"."name_translation_id" in (select translation_id from translation_text where translated_text like :searchTerm${i})`, {[`searchTerm${i}`]: searchTerm})
      }
    }

    q = q.take(limit).skip(offset)
      .leftJoinAndSelect('geo.geoType', 'geo_type')
      .leftJoinAndSelect('geo.photos', 'photos')
      .leftJoinAndSelect('geo.nameTranslation', 'translation')
      .leftJoinAndSelect('translation.translationText', 'translation_text')
    return await q.getMany()
  }
}
