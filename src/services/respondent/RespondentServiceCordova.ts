import RespondentServiceInterface from './RespondentServiceInterface'
import RespondentFill from '../../entities/trellis/RespondentFill'
import Respondent from '../../entities/trellis/Respondent'
import RespondentName from '../../entities/trellis/RespondentName'
import RespondentGeo from '../../entities/trellis/RespondentGeo'
import StudyRespondent from '../../entities/trellis/StudyRespondent'
import DatabaseService from '../../services/database/DatabaseService'
import {Brackets, IsNull} from 'typeorm'
import uuid from 'uuid/v4'

export default class RespondentServiceCordova implements RespondentServiceInterface {

  async getRespondentFillsById (respondentId) {
    const connection = await DatabaseService.getDatabase()
    const repository = await connection.getRepository(RespondentFill)
    return repository.find({ deletedAt: null, respondentId: respondentId })
  }

  async getRespondentById (respondentId) {
    const repository = await DatabaseService.getRepository(Respondent)
    return await repository.findOne({
      where: {
        deletedAt: IsNull(),
        id: respondentId
      },
      relations: [
        'photos',
        'geos',
        'names',
        'geos.geo',
        'geos.geo.photos',
        'geos.geo.geoType',
        'geos.geo.nameTranslation'
      ]
    })
  }

  async getSearchPage (studyId, query, filters, page = 0, size = 50, respondentId = null) {
    const connection = await DatabaseService.getDatabase()
    const repository = await connection.getRepository(Respondent)
    const queryBuilder = await repository.createQueryBuilder('respondent')
    let q = queryBuilder.where('"respondent"."id" in (select respondent_id from study_respondent where study_id = :studyId)', {studyId: studyId})

    if (respondentId !== null) {
      q = q.andWhere(new Brackets(qb => {
        qb.where('associated_respondent_id is null')
          .orWhere('associated_respondent_id = :respondentId', {respondentId: respondentId})
      }))
    }

    if (typeof query === 'string' && query.trim().length > 0) {
      const searchTerms = query.split(' ')
      console.log('searchTerms', searchTerms)
      for (let i = 0; i < searchTerms.length; i++) {
        let searchTerm = '% ' + searchTerms[i].trim() + '%'
        q = q.andWhere(`"respondent"."id" in (select distinct respondent_id from respondent_name where " " || name like :searchTerm${i})`, {[`searchTerm${i}`]: searchTerm})
      }
    }

    if (filters.conditionTags instanceof Array && filters.conditionTags.length > 0) {
      let conditionTagNames = filters.conditionTags
      if (conditionTagNames.length > 1) {
        q = q.andWhere('"respondent"."id" in (' +
                          'select distinct respondent_id from respondent_condition_tag where condition_tag_id in (' +
                            'select id from condition_tag where name in (:...conditionTagNames)) ' +
                          'group by respondent_id having count(distinct condition_tag_id) = :conditionCount)',
          {conditionTagNames: conditionTagNames, conditionCount: conditionTagNames.length})
      } else {
        q = q.andWhere('"respondent"."id" in (' +
                          'select distinct respondent_id from respondent_condition_tag where condition_tag_id in (' +
                            'select id from condition_tag where name in (:...conditionTagNames)))',
          {conditionTagNames: conditionTagNames})
      }
    }

    if (filters.geos instanceof Array && filters.geos.length > 0) {
      let geos = filters.geos
      if (filters.include_children) {
        // TODO: Include geo IDs from children of geos
      }
      const geoIds = geos.join(',')
      q = q.andWhere('"respondent"."id" in (select distinct respondent_id from respondent_geo where geo_id in (:geoIds))', {geoIds: geoIds})
    }

    q = q.limit(size).offset(page * size)
    q = q.leftJoinAndSelect('respondent.photos', 'photo')
    q = q.leftJoinAndSelect('respondent.names', 'respondent_name')
    return await q.getMany()
  }

  async addName (respondentId, name, isDisplayName = null, localeId = null) {
    const respondentName = new RespondentName()
    respondentName.id = uuid()
    respondentName.isDisplayName = isDisplayName
    respondentName.name = name
    respondentName.respondentId = respondentId
    respondentName.localeId = localeId
    respondentName.previousRespondentNameId = null
    const connection = await DatabaseService.getDatabase()
    await connection.manager.save(respondentName)
    return respondentName
  }

  async editName (respondentId, respondentNameId, newName, isDisplayName = null, localeId = null) {
    const connection = await DatabaseService.getDatabase()
    const repository = await connection.getRepository(RespondentName)
    const oldRespondentName = await repository.findOne(respondentNameId)
    const editedRespondentName = new RespondentName()
    editedRespondentName.id = uuid()
    editedRespondentName.isDisplayName = (isDisplayName === null) ? oldRespondentName.isDisplayName : isDisplayName
    editedRespondentName.name = newName
    editedRespondentName.respondentId = respondentId
    editedRespondentName.localeId = (localeId === null) ? oldRespondentName.locale : localeId
    editedRespondentName.previousRespondentNameId = oldRespondentName.id
    await repository.save(editedRespondentName)
    // Soft delete the old name
    await repository.update({id: oldRespondentName.id}, {deletedAt: new Date()})
    return editedRespondentName
  }

  async removeName (respondentId, respondentNameId) {
    const connection = await DatabaseService.getDatabase()
    const repository = await connection.getRepository(RespondentName)
    const respondentName = await repository.findOne(respondentNameId)
    await repository.update({id: respondentName.id}, {deletedAt: new Date()})
  }

  async createRespondent (studyId, name, geoId = null, associatedRespondentId = null) {
    const connection = await DatabaseService.getDatabase()

    const respondent = new Respondent()
    respondent.id = uuid()
    respondent.assignedId = null
    respondent.geoId = geoId
    respondent.notes = ''
    respondent.geoNotes = ''
    respondent.name = name
    respondent.associatedRespondentId = associatedRespondentId
    await connection.manager.save(respondent)

    const respondentName = new RespondentName()
    respondentName.id = uuid()
    respondentName.isDisplayName = true
    respondentName.name = name
    respondentName.respondentId = respondent.id
    respondentName.localeId = null
    respondentName.previousRespondentNameId = null
    await connection.manager.save(respondentName)

    const respondentGeo = new RespondentGeo()
    respondentGeo.id = uuid()
    respondentGeo.geoId = geoId
    respondentGeo.respondentId = respondent.id
    respondentGeo.previousRespondentGeoId = null
    respondentGeo.notes = ''
    respondentGeo.isCurrent = true
    await connection.manager.save(respondentGeo)

    const studyRespondent = new StudyRespondent()
    studyRespondent.id = uuid()
    studyRespondent.studyId = studyId
    studyRespondent.respondentId = respondent.id
    await connection.manager.save(studyRespondent)

    return respondent
  }

  async addRespondentGeo (respondentId: string, geoId: string): Promise<RespondentGeo> {
    const repo = await DatabaseService.getRepository(RespondentGeo)
    const respondentGeo = new RespondentGeo()
    respondentGeo.geoId = geoId
    respondentGeo.respondentId = respondentId
    respondentGeo.previousRespondentGeoId = null
    respondentGeo.notes = null
    respondentGeo.isCurrent = false
    let rGeo = await repo.save(respondentGeo)
    rGeo = await repo.findOne({
      where: {
        id: rGeo.id
      },
      relations: [
        'geo',
        'geo.photos',
        'geo.geoType',
        'geo.nameTranslation'
      ]
    })
    return rGeo
  }

  async editRespondentGeo (respondentId, respondentGeoId, isCurrent) {
    const connection = await DatabaseService.getDatabase()
    const repository = await connection.getRepository(RespondentGeo)
    await repository.update({id: respondentGeoId}, {isCurrent: isCurrent})
    return await repository.findOne({ deletedAt: null, id: respondentGeoId })
  }

  async moveRespondentGeo (respondentId, respondentGeoId, newGeoId) {
    const connection = await DatabaseService.getDatabase()
    const repository = await connection.getRepository(RespondentGeo)
    const oldRespondentGeo = await repository.findOne(respondentGeoId)

    const newRespondentGeo = new RespondentGeo()
    newRespondentGeo.id = uuid()
    newRespondentGeo.geoId = newGeoId
    newRespondentGeo.respondentId = respondentId
    newRespondentGeo.previousRespondentGeoId = respondentGeoId
    newRespondentGeo.notes = oldRespondentGeo.isCurrent
    newRespondentGeo.isCurrent = oldRespondentGeo.isCurrent
    await connection.manager.save(newRespondentGeo)

    // Soft delete the previous respondent geo
    await repository.update({id: respondentGeoId}, {deletedAt: new Date()})

    return newRespondentGeo
  }

  async removeRespondentGeo (respondentId, respondentGeoId) {
    const connection = await DatabaseService.getDatabase()
    const repository = await connection.getRepository(RespondentGeo)
    await repository.update({id: respondentGeoId}, {deletedAt: new Date()})
  }
}
