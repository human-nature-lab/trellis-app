import DatabaseService from '../database'
import ConditionTagInterface from './ConditionTagInterface'
import RespondentConditionTag from '../../entities/trellis/RespondentConditionTag'
import ConditionTag from '../../entities/trellis/ConditionTag'
import uuid from 'uuid/v4'
import { IsNull } from 'typeorm'

export class ConditionTagCordova implements ConditionTagInterface {

  async getRespondentConditionTagById (respondentConditionTagId: string): Promise<RespondentConditionTag> {
    const repo = await DatabaseService.getRepository(RespondentConditionTag)
    const respondentConditionTag: RespondentConditionTag = await repo.findOneOrFail({
      id: respondentConditionTagId,
      deletedAt: IsNull()
    })
    return respondentConditionTag
  }

  async getRespondentConditionTagNames (): Promise<String[]> {
    const connection = await DatabaseService.getDatabase()
    const conditionTagNames = await connection.query(`select distinct name from condition_tag;`)
    return conditionTagNames.map((c) => c.name)
  }

  async createConditionTag (name: string): Promise<ConditionTag> {
    const connection = await DatabaseService.getDatabase()
    const conditionTag = new ConditionTag()
    conditionTag.id = uuid()
    conditionTag.name = name
    await connection.manager.save(conditionTag)
    return conditionTag
  }

  async createRespondentConditionTag (respondentId: string, conditionTagId: string): Promise<RespondentConditionTag> {
    const connection = await DatabaseService.getDatabase()
    const respondentConditionTag = new RespondentConditionTag()
    respondentConditionTag.id = uuid()
    respondentConditionTag.respondentId = respondentId
    respondentConditionTag.conditionTagId = conditionTagId
    const returnConditionTag = await connection.manager.save(respondentConditionTag)
    return this.getRespondentConditionTagById(returnConditionTag.id)
  }

  async removeRespondentConditionTag (respondentId: string, conditionTagId: string): Promise<void> {
    console.log('removeRespondentConditionTag', conditionTagId)
    const connection = await DatabaseService.getDatabase()
    const repository = await connection.getRepository(RespondentConditionTag)
    await repository.update({id: conditionTagId}, {deletedAt: new Date()})
    const removedRCT = await repository.find({id: conditionTagId})
    console.log('removedRCT', removedRCT)
  }

  async respondent (): Promise<ConditionTag[]>   {
    const repo = await DatabaseService.getRepository(ConditionTag)
    const queryBuilder = await repo.createQueryBuilder('condition_tag')
    let q = queryBuilder.where('id in (select condition_tag_id from respondent_condition_tag)')
      .orWhere(`id in (select condition_tag_id from assign_condition_tag where scope='respondent')`)
    return q.getMany()
  }

  async all (): Promise<ConditionTag[]> {
    const repo = await DatabaseService.getRepository(ConditionTag)
    return repo.find()
  }

  importRespondentConditionTags (file: File, studyId: string): Promise<any> {
    throw new Error('Not implemented')
  }
}