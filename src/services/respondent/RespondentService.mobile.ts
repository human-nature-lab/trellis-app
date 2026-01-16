import { randomIntBits } from '../../classes/M'
import { RandomPagination, RandomPaginationResult } from '../../types/Pagination'
import RespondentServiceInterface, { SearchFilter } from './RespondentServiceInterface'
import RespondentFill from '../../entities/trellis/RespondentFill'
import Respondent from '../../entities/trellis/Respondent'
import RespondentName from '../../entities/trellis/RespondentName'
import RespondentGeo from '../../entities/trellis/RespondentGeo'
import StudyRespondent from '../../entities/trellis/StudyRespondent'
import DatabaseService from '../database'
import { Connection, EntityManager, In, IsNull, Brackets } from 'typeorm'
import RespondentPhoto from '../../entities/trellis/RespondentPhoto'
import Photo from '../../entities/trellis/Photo'
import { removeSoftDeleted } from '../database/SoftDeleteHelper'
import Geo from '../../entities/trellis/Geo'
import PhotoWithPivotTable from '../../types/PhotoWithPivotTable'

export class RespondentService implements RespondentServiceInterface {
  private maxGeoLevel: Record<string, number> = {}

  async addPhoto (respondentId: string, photo: Photo): Promise<PhotoWithPivotTable> {
    const repo = await DatabaseService.getRepository(RespondentPhoto)
    const rPhoto = new RespondentPhoto()
    rPhoto.photoId = photo.id
    rPhoto.respondentId = respondentId
    rPhoto.sortOrder = await repo.createQueryBuilder('rp').where('rp.respondentId = :respondentId', { respondentId }).getCount()
    await repo.save(rPhoto)
    const respondentPhoto = await repo.findOne({
      where: {
        id: rPhoto.id,
      },
      relations: [
        'photo',
      ],
    })
    return new PhotoWithPivotTable(respondentPhoto)
  }

  async removePhoto (photo: PhotoWithPivotTable) {
    const repository = await DatabaseService.getRepository(RespondentPhoto)
    await repository.update({
      id: photo.pivot.id,
    }, {
      deletedAt: new Date(),
    })
  }

  async updatePhotos (photosWithPivotTable : Array<PhotoWithPivotTable>) {
    const repository = await DatabaseService.getRepository(RespondentPhoto)
    for (const photoWithPivotTable of photosWithPivotTable) {
      await repository.update({
        id: photoWithPivotTable.pivot.id,
      }, {
        sortOrder: photoWithPivotTable.pivot.sortOrder,
        notes: photoWithPivotTable.pivot.notes,
      })
    }
  }

  async getRespondentFillsById (respondentId: string): Promise<RespondentFill[]> {
    const connection = await DatabaseService.getDatabase()
    const repository = await connection.getRepository(RespondentFill)
    return repository.find({ deletedAt: null, respondentId: respondentId })
  }

  async getRespondentPhotos (respondentId: string): Promise<Array<PhotoWithPivotTable>> {
    const respondentPhotoRepository = await DatabaseService.getRepository(RespondentPhoto)
    const respondentPhotos = await respondentPhotoRepository.find({
      where: {
        deletedAt: IsNull(),
        respondentId: respondentId,
      },
      relations: [
        'photo',
      ],
    })
    const photos: PhotoWithPivotTable[] = []
    for (let i = 0; i < respondentPhotos.length; i++) {
      const respondentPhoto = respondentPhotos[i]
      photos.push(new PhotoWithPivotTable(respondentPhoto))
    }

    return photos
  }

  async getRespondentById (respondentId: string): Promise<Respondent> {
    const repository = await DatabaseService.getRepository(Respondent)
    const respondent = await repository.findOne({
      where: {
        deletedAt: IsNull(),
        id: respondentId,
      },
      relations: [
        'geos',
        'names',
        'geos.geo',
        'geos.geo.photos',
        'geos.geo.geoType',
        'geos.geo.nameTranslation',
        'respondentConditionTags',
      ],
    })

    respondent.photos = await this.getRespondentPhotos(respondentId)
    removeSoftDeleted(respondent)
    return respondent
  }

  async getRespondentsByIds (respondentIds: string[]) {
    const repository = await DatabaseService.getRepository(Respondent)
    const respondents = await repository.find({
      where: {
        deletedAt: IsNull(),
        id: In(respondentIds),
      },
      relations: [
        'geos',
        'names',
        'photos',
        'geos.geo',
        'geos.geo.photos',
        'geos.geo.geoType',
        'geos.geo.nameTranslation',
      ],
    })
    const photos = await Promise.all(respondents.map(r => this.getRespondentPhotos(r.id)))
    for (const i in respondents) {
      respondents[i].photos = photos[i]
      removeSoftDeleted(respondents[i])
    }
    return respondents
  }

  /**
   * Build the list of geoIds to include in the query. This list can get very big if the includeChildren flag is on.
   * @param {string[]} geos
   * @param {boolean} includeChildren
   * @returns {Promise<string[]>}
   */
  private async getGeoIds (geos: string[], includeChildren: boolean): Promise<string[]> {
    geos = geos.slice()
    let parentGeos = geos.slice()
    const maxLimit = 10
    if (includeChildren) {
      const geoRepo = await DatabaseService.getRepository(Geo)
      let hasMoreChildren = true
      let c = 0
      while (hasMoreChildren && c < maxLimit) {
        c++
        hasMoreChildren = false
        const q = (await geoRepo.createQueryBuilder('geo'))
          .where('geo.parent_id in (:...parentGeos)', { parentGeos })
          .andWhere('geo.deleted_at is null')
          .leftJoinAndSelect('geo.geoType', 'gt')
        const children = await q.getMany()
        geos = geos.concat(children.filter(g => g.geoType.canContainRespondent).map(g => g.id))
        parentGeos = children.map(g => g.id)
        hasMoreChildren = children.length > 0
        console.log('hasMoreChildren', hasMoreChildren)
      }
    }
    return geos
  }

  async getMaxGeoLevel (studyId: string): Promise<number> {
    if (this.maxGeoLevel[studyId]) {
      return this.maxGeoLevel[studyId]
    }
    const sql = `
      WITH RECURSIVE tree AS (
        SELECT id, parent_id, 1 AS depth
        FROM geo_type
        WHERE parent_id IS NULL and deleted_at is null
        UNION ALL
        SELECT c.id, c.parent_id, p.depth + 1
        FROM geo_type c
        JOIN tree p ON c.parent_id = p.id and c.deleted_at is null
      )
      SELECT MAX(depth) AS max_depth FROM tree;
    `
    const db = await DatabaseService.getDatabase()
    const [row] = await db.query(sql)
    this.maxGeoLevel[studyId] = +row.max_depth || 3
    return this.maxGeoLevel[studyId]
  }

  async getSearchPage (studyId: string, query: string, filters: SearchFilter, pagination: RandomPagination, respondentId = null): Promise<RandomPaginationResult<Respondent>> {
    const repository = await DatabaseService.getRepository(Respondent)
    const queryBuilder = await repository.createQueryBuilder('respondent')

    const limitQb = repository.createQueryBuilder('r')
    limitQb.select('r.id')
    limitQb.andWhere('r.deleted_at is null')
    limitQb.andWhere('r.id in (select respondent_id from study_respondent where study_id = :studyId)', { studyId })

    // Query string broken into words
    if (typeof query === 'string' && query.trim().length > 0) {
      const searchTerms = query.split(' ')
      for (let i = 0; i < searchTerms.length; i++) {
        const searchTerm = '% ' + searchTerms[i].trim() + '%'
        const key = `spaceTerm${i}`
        const q = filters.looseMatching
          ? `r.id in (select respondent_id from respondent_name where name like :${key})`
          : `r.id in (select respondent_id from respondent_name where " " || name like :${key})`
        limitQb.andWhere(q, { [key]: searchTerm })
      }
    }

    let geoLevels: number
    if (filters.includeChildren && Array.isArray(filters.geos) && filters.geos.length > 0) {
      geoLevels = await this.getMaxGeoLevel(studyId)
    }

    limitQb.andWhere(new Brackets(qb => {
      // Condition tag filters
      if (Array.isArray(filters.conditionTags) && filters.conditionTags.length > 0) {
        // TODO: Couldn't we just add several where conditions instead of a group by?
        for (let i = 0; i < filters.conditionTags.length; i++) {
          const tagName = filters.conditionTags[i]
          const key = `andConditionTag${i}`
          qb.andWhere(
            `r.id in (
              select respondent_id from respondent_condition_tag where condition_tag_id in (
                select id from condition_tag where name = :${key}
              )
            )`,
            { [key]: tagName },
          )
        }
      }

      // Geo filters
      if (Array.isArray(filters.geos) && filters.geos.length > 0) {
        console.log(`using ${geoLevels} geo levels for study ${studyId}`)
        const geoQb = limitQb.subQuery().from(RespondentGeo, 'rg')
        geoQb.select('rg.respondent_id')
        geoQb.where('rg.deleted_at is null')
        // geoQb.andWhere('rg.geo_id in (:...geoIds)', { geoIds: filters.geos })
        geoQb.andWhere(new Brackets(qb => {
          qb.orWhere('rg.geo_id in (:...geoIds)', { geoIds: filters.geos })
          if (filters.includeChildren) {
            const q = k => `select id from geo where parent_id in (${k})`
            for (let i = 0; i < geoLevels; i++) {
              let sql = q(':...geoIds')
              for (let l = 0; l < i; l++) {
                sql = q(sql)
              }
              qb.orWhere(`rg.geo_id in (${sql})`, { geoIds: filters.geos })
            }
          }
        }))

        if (filters.onlyCurrentGeo) {
          geoQb.andWhere('rg.is_current = 1')
        }

        const geoSql = geoQb.getQuery()
        const geoParams = geoQb.getParameters()
        qb.andWhere(`r.id in ${geoSql}`, geoParams)
      }

      // Or Condition tags
      if (Array.isArray(filters.orConditionTags) && filters.orConditionTags.length > 0) {
        qb.andWhere(
          `r.id in (
            select respondent_id from respondent_condition_tag where deleted_at is null and condition_tag_id in (
              select id from condition_tag where name in (:...orConditionTags)
            )
          )`,
          { orConditionTags: filters.orConditionTags },
        )
      }
      if (respondentId) {
        qb.orWhere('r.associated_respondent_id = :respondentId', { respondentId })
      }
    }))

    let limitSql = limitQb.getQuery()
    const limitParams = limitQb.getParameters()

    // this version of typeorm is apparently creating invalid sql so we're adding a hack to fix it
    if (limitSql.endsWith(' AND')) {
      limitSql = limitSql.slice(0, -4)
    }

    const seed = pagination.seed || randomIntBits(24)
    if (filters.randomize || filters.randomize === null || filters.randomize === undefined) {
      // Psuedo-random sort order is achieved as described here -> https://stackoverflow.com/a/24511461/5551941
      limitSql += ` order by substr(r.rowid * ${seed}, length(r.rowid) + 2)`
    } else {
      limitSql += ' order by r.id'
    }
    let total = 0
    // I've wrapped this in a try/catch because typeorm generates invalid sql for some variants of this query for some
    // reason
    try {
      total = await limitQb.clone().select('distinct r.id').getCount()
    } catch (error) {
      console.error('failed to get total', error)
    }
    const offset = pagination.size * pagination.page
    limitSql += ` limit ${pagination.size} offset ${offset}`
    console.log('limitQuery', limitSql, limitParams)
    let q = queryBuilder.where(`respondent.id in (${limitSql})`, limitParams)
    q = q.leftJoinAndSelect('respondent.photos', 'photo', 'respondent_photo.deleted_at is null and respondent_photo.sort_order = 0')
    q = q.leftJoinAndSelect('respondent.names', 'respondent_name')
    q = q.leftJoinAndSelect('respondent.geos', 'respondent_geo')
    q = q.leftJoinAndSelect('respondent.respondentConditionTags', 'respondent_condition_tag')
    q = q.leftJoinAndSelect('respondent_condition_tag.conditionTag', 'condition_tag')

    const respondents = await q.getMany()
    removeSoftDeleted(respondents)
    console.log('respondents', respondents.length)
    return {
      page: pagination.page,
      size: pagination.size,
      seed: seed,
      total: total ?? 0,
      data: respondents,
    }
  }

  async addName (respondentId, name, isDisplayName = false, localeId = null): Promise<RespondentName> {
    const conn: Connection = await DatabaseService.getDatabase()
    let respondentName: RespondentName
    await conn.transaction(async manager => {
      respondentName = new RespondentName()
      respondentName.isDisplayName = isDisplayName
      respondentName.name = name
      respondentName.respondentId = respondentId
      respondentName.localeId = localeId
      respondentName.previousRespondentNameId = null

      if (isDisplayName) {
        await this.clearRespondentNameIsDisplay(manager, respondentId)
      }

      await manager.save(respondentName)
    })
    return respondentName
  }

  async editName (respondentId, respondentNameId, newName, isDisplayName = null, localeId = null) {
    const connection = await DatabaseService.getDatabase()
    const repository = await connection.getRepository(RespondentName)
    const oldRespondentName = await repository.findOne(respondentNameId)
    const editedRespondentName = new RespondentName()
    editedRespondentName.isDisplayName = (isDisplayName === null) ? oldRespondentName.isDisplayName : isDisplayName
    editedRespondentName.name = newName
    editedRespondentName.respondentId = respondentId
    editedRespondentName.localeId = (localeId === null) ? oldRespondentName.locale : localeId
    editedRespondentName.previousRespondentNameId = oldRespondentName.id
    await repository.save(editedRespondentName)
    // Soft delete the old name
    await repository.update({ id: oldRespondentName.id }, { deletedAt: new Date() })
    return editedRespondentName
  }

  async removeName (respondentId, respondentNameId) {
    const connection = await DatabaseService.getDatabase()
    const repository = await connection.getRepository(RespondentName)
    const respondentName = await repository.findOne(respondentNameId)
    await repository.update({ id: respondentName.id }, { deletedAt: new Date() })
  }

  async createRespondent (studyId, name, geoId = null, associatedRespondentId = null) {
    const connection: Connection = await DatabaseService.getDatabase()
    const queryRunner = connection.createQueryRunner()
    await queryRunner.startTransaction()
    try {
      const respondent = new Respondent()
      respondent.assignedId = null
      respondent.geoId = geoId
      respondent.notes = ''
      respondent.geoNotes = ''
      respondent.name = name
      respondent.associatedRespondentId = associatedRespondentId
      await queryRunner.manager.save(respondent)

      const respondentName = new RespondentName()
      respondentName.isDisplayName = true
      respondentName.name = name
      respondentName.respondentId = respondent.id
      respondentName.localeId = null
      respondentName.previousRespondentNameId = null
      await queryRunner.manager.save(respondentName)

      if (geoId !== null) {
        const respondentGeo = new RespondentGeo()
        respondentGeo.geoId = geoId
        respondentGeo.respondentId = respondent.id
        respondentGeo.previousRespondentGeoId = null
        respondentGeo.notes = ''
        respondentGeo.isCurrent = true
        await queryRunner.manager.save(respondentGeo)
      }

      const studyRespondent = new StudyRespondent()
      studyRespondent.studyId = studyId
      studyRespondent.respondentId = respondent.id
      await queryRunner.manager.save(studyRespondent)

      await queryRunner.commitTransaction()

      const repository = connection.getRepository(Respondent)
      return repository.findOne({
        where: {
          id: respondent.id,
        },
        relations: ['photos', 'names'],
      })
    } catch (err) {
      console.error(err)
      await queryRunner.rollbackTransaction()
      throw err
    }
  }

  async clearRespondentNameIsDisplay (manager: EntityManager, respondentId: string) {
    await manager.update(RespondentName, { respondentId }, { isDisplayName: false })
  }

  async clearRespondentGeoIsCurrent (manager: EntityManager, respondentId: string) {
    await manager.update(RespondentGeo, { respondentId }, { isCurrent: false })
  }

  async addRespondentGeo (respondentId: string, geoId: string, isCurrent: boolean): Promise<RespondentGeo> {
    const conn: Connection = await DatabaseService.getDatabase()
    let rGeo: RespondentGeo
    await conn.transaction(async manager => {
      const respondentGeo = new RespondentGeo()
      respondentGeo.geoId = geoId
      respondentGeo.respondentId = respondentId
      respondentGeo.previousRespondentGeoId = null
      respondentGeo.notes = null
      respondentGeo.isCurrent = isCurrent
      if (respondentGeo.isCurrent) {
        await this.clearRespondentGeoIsCurrent(manager, respondentId)
      }
      rGeo = await manager.save(respondentGeo)
      rGeo = await manager.findOne(RespondentGeo, {
        where: {
          id: rGeo.id,
        },
        relations: [
          'geo',
          'geo.photos',
          'geo.geoType',
          'geo.nameTranslation',
        ],
      })
    })
    return rGeo
  }

  async editRespondentGeo (respondentId: string, respondentGeoId: string, isCurrent: boolean) {
    const connection = await DatabaseService.getDatabase()
    const repository = await connection.getRepository(RespondentGeo)
    await repository.update({ id: respondentGeoId }, { isCurrent: isCurrent })
    return repository.findOne({ deletedAt: null, id: respondentGeoId })
  }

  async moveRespondentGeo (respondentId: string, respondentGeoId: string, newGeoId: string, isCurrent?: boolean, notes?: string) {
    const connection = await DatabaseService.getDatabase()
    const repository = await connection.getRepository(RespondentGeo)
    const oldRespondentGeo = await repository.findOne(respondentGeoId)

    const newRespondentGeo = new RespondentGeo()
    newRespondentGeo.geoId = newGeoId
    newRespondentGeo.respondentId = respondentId
    newRespondentGeo.previousRespondentGeoId = respondentGeoId
    newRespondentGeo.notes = notes || oldRespondentGeo.isCurrent
    newRespondentGeo.isCurrent = isCurrent !== undefined ? isCurrent : oldRespondentGeo.isCurrent
    await connection.manager.save(newRespondentGeo)

    // Set the previous respondent geo is_current to 0
    await repository.update({ id: respondentGeoId }, { isCurrent: 0 })

    return repository.findOne({
      where: {
        id: newRespondentGeo.id,
      },
      relations: ['geo', 'geo.geoType', 'geo.nameTranslation'],
    })
  }

  async removeRespondentGeo (respondentId: string, respondentGeoId: string) {
    const connection = await DatabaseService.getDatabase()
    const repository = await connection.getRepository(RespondentGeo)
    await repository.update({ id: respondentGeoId }, { deletedAt: new Date() })
  }

  async removeRespondent (respondentId: string) {
    const conn = await DatabaseService.getDatabase()
    await conn.createQueryBuilder()
      .update(Respondent)
      .set({ deletedAt: () => 'CURRENT_TIMESTAMP' })
      .where('id = :id', { id: respondentId })
      .execute()
  }

  async importRespondents (file: File, studyId: string): Promise<Respondent[]> {
    throw new Error('Not implemented')
  }

  async importRespondentPhotos (file: File, studyId: string): Promise<void> {
    throw new Error('Not implemented')
  }

  importRespondentGeos (file: File, studyId: string): Promise<any> {
    throw new Error('Not implemented')
  }

  async listEdges (respondentId: string) {
    throw new Error('Not implemented')
  }
}
