import DatabaseService from '../database/DatabaseService'
import ConditionTagInterface from './ConditionTagInterface'
import RespondentConditionTag from '../../entities/trellis/RespondentConditionTag'
import ConditionTag from '../../entities/trellis/ConditionTag'
import uuid from 'uuid/v4'

export class ConditionTagCordova implements ConditionTagInterface {

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
    respondentConditionTag.id = uuid()
    respondentConditionTag.respondentId = respondentId
    respondentConditionTag.conditionTagId = conditionTagId
    await connection.manager.save(respondentConditionTag)
    return respondentConditionTag
  }

  async removeRespondentConditionTag (respondentId, conditionTagId) {
    const connection = await DatabaseService.getDatabase()
    const repository = await connection.getRepository(RespondentConditionTag)
    await repository.update({id: conditionTagId}, {deletedAt: new Date()})
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
