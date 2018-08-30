import {Relationship, Serializable} from '../decorators/WebOrmDecorators'
import {Column, Entity, PrimaryGeneratedColumn} from 'typeorm'
import TimestampedSoftDelete from "../base/TimestampedSoftDelete";
import SnakeSerializable from "../interfaces/SnakeSerializable";
import ConditionTag from "./ConditionTag";
import {now} from '../../services/DateService'

@Entity()
export default class SectionConditionTag extends TimestampedSoftDelete implements SnakeSerializable{
  @PrimaryGeneratedColumn() @Serializable
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
  @Column() @Serializable
  interviewId: string

  @Relationship({
    constructor: ConditionTag,
    jsonKey: 'condition'
  })
  conditionTag: ConditionTag

  fromRecycler (id: string, sectionId: string, conditionId: string, repetition: number, followUpDatumId: string, interviewId: string, surveyId: string) {
    this.id = id
    this.sectionId = sectionId
    this.conditionId = conditionId
    this.repetition = repetition
    this.followUpDatumId = followUpDatumId
    this.interviewId = interviewId
    this.surveyId = surveyId
    this.createdAt = now()
    this.updatedAt = now()
    return this
  }

}
