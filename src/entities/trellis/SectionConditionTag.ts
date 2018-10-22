import {Relationship, Serializable} from '../decorators/WebOrmDecorators'
import {Column, Entity, JoinColumn, OneToOne, PrimaryColumn} from 'typeorm'
import TimestampedSoftDelete from '../base/TimestampedSoftDelete'
import SnakeSerializable from '../interfaces/SnakeSerializable'
import ConditionTag from './ConditionTag'
import {now} from '../../services/DateService'

export interface SectionConditionTagRecylerData {
  id: string
  sectionId: string
  conditionId: string
  repetition: number
  followUpDatumId: string
  interviewId: string
  surveyId: string
}

@Entity()
export default class SectionConditionTag extends TimestampedSoftDelete implements SnakeSerializable{
  @PrimaryColumn() @Serializable
  id: string;
  @Column() @Serializable
  sectionId: string
  @Column() @Serializable
  conditionId: string
  @Column() @Serializable
  surveyId: string
  @Column({ type: 'integer' }) @Serializable
  repetition: number
  @Column() @Serializable
  followUpDatumId: string

  //Future
  // @Column() @Serializable
  // interviewId: string

  @Relationship({
    constructor: () => ConditionTag,
    jsonKey: 'condition'
  })
  @OneToOne(type => ConditionTag, { eager: true })
  @JoinColumn({ name: 'condition_id' })
  conditionTag: ConditionTag

  fromRecycler (data: SectionConditionTagRecylerData) {
    for (let key in data) {
      if (data[key] !== undefined) {
        this[key] = data[key]
      }
    }
    this.deletedAt = null
    this.createdAt = now()
    this.updatedAt = now()
    return this
  }

  copy () {
    let s = new SectionConditionTag()
    s.id = this.id
    s.sectionId = this.sectionId
    s.conditionId = this.conditionId
    s.surveyId = this.surveyId
    s.repetition = this.repetition
    s.followUpDatumId = this.followUpDatumId
    return s
  }

}
