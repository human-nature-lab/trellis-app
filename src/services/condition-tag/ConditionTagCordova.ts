import DatabaseService from '../database/DatabaseService'
import ConditionTagInterface from './ConditionTagInterface'
import RespondentConditionTag from '../../entities/trellis/RespondentConditionTag'
import ConditionTag from '../../entities/trellis/ConditionTag'
import uuid from 'uuid/v4'

export class ConditionTagCordova implements ConditionTagInterface {

  async getRespondentConditionTagById (respondentConditionTagId) {
    const repository = await DatabaseService.getRepository(RespondentConditionTag)
    const respondentConditionTag = await repository.findOneOrFail({
      id: respondentConditionTagId,
      deletedAt: null
    })
    return respondentConditionTag
  }

  async createConditionTag (name) {
    const connection = await DatabaseService.getDatabase()
    const conditionTag = new ConditionTag()
    conditionTag.id = uuid()
    conditionTag.name = name
    await connection.manager.save(conditionTag)
    return conditionTag
  }

  async createRespondentConditionTag (respondentId, conditionTagId) {
    const connection = await DatabaseService.getDatabase()
    const respondentConditionTag = new RespondentConditionTag()
    respondentConditionTag.respondentId = respondentId
    respondentConditionTag.conditionTagId = conditionTagId
    const returnConditionTag = await connection.manager.save(respondentConditionTag)
    return await this.getRespondentConditionTagById(returnConditionTag.id)
  }

  async removeRespondentConditionTag (respondentId, conditionTagId) {
    console.log('removeRespondentConditionTag', conditionTagId)
    const connection = await DatabaseService.getDatabase()
    const repository = await connection.getRepository(RespondentConditionTag)
    await repository.update({id: conditionTagId}, {deletedAt: new Date()})
    const removedRCT = await repository.find({id: conditionTagId})
    console.log('removedRCT', removedRCT)
  }

  async respondent () {
    const connection = await DatabaseService.getDatabase()
    const repository = await connection.getRepository(ConditionTag)
    const queryBuilder = await repository.createQueryBuilder('condition_tag')
    let q = queryBuilder.where('id in (select condition_tag_id from respondent_condition_tag)')
    return await q.getMany()
  }

  async all () {
    const connection = await DatabaseService.getDatabase()
    const repository = await connection.getRepository(ConditionTag)
    return await repository.find()
  }
}

export default new ConditionTagCordova()
