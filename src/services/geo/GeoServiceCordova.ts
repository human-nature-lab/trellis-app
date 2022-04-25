import DatabaseService from '../database'
import { isUndefined } from '../util'
import GeoServiceAbstract, { GeoSearchParams } from './GeoServiceAbstract'
import Geo from '../../entities/trellis/Geo'
import { In, IsNull } from 'typeorm'
import GeoType from '../../entities/trellis/GeoType'
import uuid from 'uuid/v4'
import GeoPhoto from '../../entities/trellis/GeoPhoto'
import Photo from '../../entities/trellis/Photo'
import geoCache from './GeoCache'
import PhotoWithPivotTable from '../../types/PhotoWithPivotTable'
import { removeSoftDeleted } from '../database/SoftDeleteHelper'

export default class GeoServiceCordova extends GeoServiceAbstract {

  async addPhoto (geoId: string, photo: Photo): Promise<PhotoWithPivotTable> {
    const repo = await DatabaseService.getRepository(GeoPhoto)
    let gPhoto = new GeoPhoto()
    gPhoto.photoId = photo.id
    gPhoto.geoId = geoId
    gPhoto.sortOrder = await repo.createQueryBuilder('gp').where('gp.geoId = :geoId', { geoId }).getCount()
    await repo.save(gPhoto)
    let geoPhoto = await repo.findOne({
      where: {
        id: gPhoto.id
      },
      relations: [
        'photo'
      ]
    })
    return new PhotoWithPivotTable(geoPhoto)
  }

  async getGeoById (geoId) {
    const repository = await DatabaseService.getRepository(Geo)
    let geo = await repository.findOne({
      where: {
        deletedAt: IsNull(),
        id: geoId
      },
      relations: ['geoType', 'nameTranslation', 'nameTranslation.translationText']
    })
    if (!geo) return null
    geo.photos = await this.getGeoPhotos(geoId)
    removeSoftDeleted(geo)
    return geo
  }

  async getGeosByParentId (studyId: string, parentId: string): Promise<Geo[]> {
    const repo = await DatabaseService.getRepository(Geo)
    let qb = repo.createQueryBuilder('geo')
      .where('geo_type.study_id = :studyId', { studyId })
      .leftJoinAndSelect('geo.geoType', 'geo_type', 'geo_type.id = geo.geoTypeId')
      .leftJoinAndSelect('geo.photos', 'photo')
      .leftJoinAndSelect('geo.nameTranslation', 'translation')
      .leftJoinAndSelect('translation.translationText', 'translation_text')
    if (parentId === null) {
      qb = qb.where('geo.parentId is null')
    } else {
      qb = qb.where('geo.parentId = :parentId', { parentId })
    }
    return qb.getMany()
  }

  async updatePhotos (photosWithPivotTable: PhotoWithPivotTable[]) {
    const repository = await DatabaseService.getRepository(GeoPhoto)
    for (let photoWithPivotTable of photosWithPivotTable) {
      await repository.update({
        id: photoWithPivotTable.pivot.id
      }, {
        sortOrder: photoWithPivotTable.pivot.sortOrder,
        notes: photoWithPivotTable.pivot.notes
      })
    }
  }

  async removePhoto (photo: PhotoWithPivotTable) {
    const repository = await DatabaseService.getRepository(GeoPhoto)
    await repository.update({
      id: photo.pivot.id
    }, {
      deletedAt: new Date()
    })
  }

  async getGeoPhotos (geoId: string): Promise<PhotoWithPivotTable[]> {
    const geoPhotoRepository = await DatabaseService.getRepository(GeoPhoto)
    let geoPhotos = await geoPhotoRepository.find({
      where: {
        deletedAt: IsNull(),
        geoId: geoId
      },
      relations: [
        'photo'
      ]
    })
    let photos: PhotoWithPivotTable[] = []
    for (let i = 0; i < geoPhotos.length; i++) {
      let geoPhoto = geoPhotos[i]
      // Fixes an issue where the location info page will not load
      // if the respondent_photo table refers to a non-existent photo table row
      if (geoPhoto.photoId !== null && geoPhoto.photo !== null) {
        photos.push(new PhotoWithPivotTable(geoPhoto))
      }
    }

    return photos
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

  async updateGeo (geo: Geo) {
    const connection = await DatabaseService.getDatabase()
    const repository = await connection.getRepository(Geo)
    await repository.save(geo)
  }

  async getGeoTypesByStudy (studyId: string, getUserAddable: boolean): Promise<GeoType[]> {
    const connection = await DatabaseService.getDatabase()
    const repository = await connection.getRepository(GeoType)
    const queryBuilder = await repository.createQueryBuilder('geo_type')
    let q = queryBuilder.where('"geo_type"."deleted_at" is null')

    if (studyId !== null) {
      q = q.andWhere('"study_id" = :studyId', {studyId: studyId})
    }

    if (getUserAddable) {
      q = q.andWhere('"can_user_add" = 1')
    }

    return q.getMany()
  }

  async getGeosById (geoIds) {
    const repository = await DatabaseService.getRepository(Geo)
    return repository.find({
      where: {
        deletedAt: IsNull(),
        id: In(geoIds)
      },
      relations: ['geoType', 'photos', 'nameTranslation']
    })
  }

  async removeGeo (geoId) {
    const repository = await DatabaseService.getRepository(Geo)
    geoCache.del(geoId)
    return repository.update({ id: geoId }, { deletedAt: new Date() })
  }

  async moveGeo (geoId, latitude, longitude, moveChildren) {
    const connection = await DatabaseService.getDatabase()
    let q = await connection.createQueryBuilder()

    q = q.update(Geo)
      .set({ latitude: latitude, longitude: longitude })
      .where('id = :id', { id: geoId })

    if (moveChildren) {
      q = q.orWhere('parent_id = :id', { id: geoId })
    }

    return q.execute()
  }

  async getGeoAncestors (geoId) {
    let currentGeoId = geoId
    let count = 0
    let ancestorIds = {}
    let ancestors = []
    while (!isUndefined(currentGeoId) && !ancestors.hasOwnProperty(currentGeoId) && count < 25) {
      // This caching seems necessary for relationship questions when the respondent has a large number of respondent geos. This method is called for each of those
      let geo
      if (geoCache.has(currentGeoId)) {
        geo = geoCache.get(currentGeoId)
      } else {
        geo = await this.getGeoById(currentGeoId)
        geoCache.set(currentGeoId, geo)
      }
      if (!geo) break
      ancestors.push(geo)
      ancestorIds[geoId] = true
      currentGeoId = geo.parentId
      count++
    }
    return ancestors.reverse()
  }

  async search (studyId: string, params: GeoSearchParams): Promise<Geo[]> {
    const query = params.hasOwnProperty('query') ? params.query : null
    const limit = params.hasOwnProperty('limit') ? params.limit : GeoServiceCordova.DEFAULT_SEARCH_RESULTS_LIMIT
    const offset = params.hasOwnProperty('offset') ? params.offset : 0
    const parentGeoId = params.hasOwnProperty('parent') ? params.parent : null
    const onlyNoParent = params.hasOwnProperty('no-parent')
    const geoTypeIds =  params.hasOwnProperty('types') ? params.types : null

    const connection = await DatabaseService.getDatabase()
    const repository = await connection.getRepository(Geo)
    const queryBuilder = await repository.createQueryBuilder('geo')
    let q = queryBuilder.where('"geo"."deleted_at" is null')

    if (studyId !== null) {
      q = q.andWhere('"geo"."geo_type_id" in (select id from geo_type where study_id = :studyId)', { studyId })
    }

    if (parentGeoId !== null) {
      q = q.andWhere('"geo"."parent_id" = :parentGeoId', { parentGeoId })
    }

    if (parentGeoId === null && onlyNoParent) {
      q = q.andWhere('"geo"."parent_id" is null')
    }

    if (geoTypeIds !== null && Array.isArray(geoTypeIds)) {
      let geoTypeIdString = geoTypeIds.map((geoTypeId) => { return '"' + geoTypeId + '"' }).join(',')
      q = q.andWhere('"geo"."geo_type_id" in (:geoTypeIdString)', { geoTypeIdString })
    }

    if (typeof query === 'string' && query.trim().length > 0) {
      const searchTerms = query.split(' ')
      for (let i = 0; i < searchTerms.length; i++) {
        let searchTerm = '%' + searchTerms[i].trim() + '%'
        q = q.andWhere(`"geo"."name_translation_id" in (select translation_id from translation_text where translated_text like :searchTerm${i})`, { [`searchTerm${i}`]: searchTerm })
      }
    }

    q = q.take(limit).skip(offset)
      .leftJoinAndSelect('geo.geoType', 'geo_type')
      .leftJoinAndSelect('geo.photos', 'photo', 'geo_photo.deleted_at is null and geo_photo.sort_order = 0')
      .leftJoinAndSelect('geo.nameTranslation', 'translation')
      .leftJoinAndSelect('translation.translationText', 'translation_text')
    return q.getMany()
  }

  importGeos (studyId: string, file: File): Promise<Geo[]> {
    throw new Error('Not implemented')
  }

  importGeoPhotos (studyId: string, file: File): PromiseLike<void> {
    throw new Error('Not implemented')
  }
}
