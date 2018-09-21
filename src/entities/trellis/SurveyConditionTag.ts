import {Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn} from 'typeorm'
import {Relationship, Serializable} from '../decorators/WebOrmDecorators'
import TimestampedSoftDelete from '../base/TimestampedSoftDelete'
import SnakeSerializable from '../interfaces/SnakeSerializable'
import ConditionTag from './ConditionTag'
import {now} from '../../services/DateService'

interface SurveyConditionTagRecyclerData {
  id: string
  surveyId: string
  conditionId: string
  interviewId: string
  conditionTag?: ConditionTag
}

@Entity()
export default class SurveyConditionTag extends TimestampedSoftDelete implements SnakeSerializable {
  @PrimaryGeneratedColumn() @Serializable
  id: string;
  @Column() @Serializable
  surveyId: string
  @Column() @Serializable
  conditionId: string
  // Future
  // @Column() @Serializable
  // interviewId: string

  @Relationship({
    constructor: () => ConditionTag,
    jsonKey: 'condition'
  })
  @OneToOne(type => ConditionTag, { eager: true })
  @JoinColumn({ name: 'condition_id' })
  conditionTag: ConditionTag

  /**
   * Used by recycler to generate an object
   * @param {SurveyConditionTagRecyclerData} data
   * @returns {this}
   */
  fromRecycler (data: SurveyConditionTagRecyclerData) {
    for (let key in data) {
      if (data[key] !== undefined) {
        this[key] = data[key]
      }
    }
    this.createdAt = now()
    this.updatedAt = now()

    if (!data.conditionTag) {
      // TODO: Lookup and assign the condition tag
    }
    return this
  }
}
