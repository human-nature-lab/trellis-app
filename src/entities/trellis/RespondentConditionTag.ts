import {Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryColumn} from 'typeorm'
import {Relationship, Serializable} from '../decorators/WebOrmDecorators'
import TimestampedSoftDelete from '../base/TimestampedSoftDelete'
import ConditionTag from './ConditionTag'
import {now} from '../../services/DateService'
import Respondent from './Respondent'

export interface RespondentConditionTagRecylerData {
  id: string
  respondentId: string
  conditionTagId: string
}

@Entity()
export default class RespondentConditionTag extends TimestampedSoftDelete {
  @PrimaryColumn() @Serializable
  id: string
  @Column() @Serializable
  respondentId: string
  @Column() @Serializable
  conditionTagId: string

  @Relationship({
    constructor: () => ConditionTag,
    jsonKey: 'condition_tag'
  })
  @OneToOne(type => ConditionTag, { eager: true })
  @JoinColumn({ name: 'condition_tag_id' })
  conditionTag: ConditionTag

  @ManyToOne(type => Respondent, respondent => respondent.respondentConditionTags)
  respondent: Respondent

  // Handle naming inconsistencies with Section and Survey condition tags
  get conditionId () {
    return this.conditionTagId
  }
  set conditionId (id) {
    this.conditionTagId = id
  }

  fromRecycler (data: RespondentConditionTagRecylerData) {
    for (let key in data) {
      if (data[key] !== undefined) {
        this[key] = data[key]
      }
    }
    this.updatedAt = now()
    this.createdAt = now()
    return this
  }

  copy () {
    const r = new RespondentConditionTag()
    r.id = this.id
    r.respondentId = this.respondentId
    r.conditionTagId = this.conditionTagId
    r.deletedAt = this.deletedAt
    r.createdAt = this.createdAt
    r.updatedAt = this.updatedAt
    return r
  }

}
