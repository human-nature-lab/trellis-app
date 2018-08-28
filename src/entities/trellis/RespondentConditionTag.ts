import {Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn} from 'typeorm'
import {Relationship, Serializable} from '../WebOrmDecorators'
import TimestampedSoftDelete from '../base/TimestampedSoftDelete'
import ConditionTag from './ConditionTag'
import {now} from '../../services/DateService'
import Respondent from './Respondent'

@Entity()
export default class RespondentConditionTag extends TimestampedSoftDelete {
  @PrimaryGeneratedColumn() @Serializable
  id: string
  @Column() @Serializable
  respondentId: string
  @Column() @Serializable
  conditionTagId: string

  @Relationship({
    constructor: ConditionTag,
    jsonKey: 'condition'
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

  fromRecycler (id, respondentId, conditionTagId) {
    this.id = id
    this.respondentId = respondentId
    this.conditionTagId = conditionTagId
    this.updatedAt = now()
    this.createdAt = now()
    return this
  }

}
