import {Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn} from 'typeorm'
import {Relationship, Serializable} from '../decorators/WebOrmDecorators'
import TimestampedSoftDelete from '../base/TimestampedSoftDelete'
import SnakeSerializable from '../interfaces/SnakeSerializable'
import ConditionTag from './ConditionTag'
import {now} from '../../services/DateService'

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
   * @param {string} id
   * @param {string} surveyId
   * @param {string} conditionId
   * @param {string} interviewId
   * @param {ConditionTag} conditionTag
   * @returns {this}
   */
  fromRecycler (id: string, surveyId: string, conditionId: string, interviewId: string, conditionTag?: ConditionTag) {
    this.id = id
    this.surveyId = surveyId
    this.conditionId = conditionId
    // this.interviewId = interviewId
    this.createdAt = now()
    this.updatedAt = now()

    if (conditionTag) {
      this.conditionTag = conditionTag
    } else {
      // TODO: Lookup and assign the condition tag
    }
    return this
  }
}
