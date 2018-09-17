import {Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn} from 'typeorm'
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
  @PrimaryGeneratedColumn('uuid') @Serializable
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

}
