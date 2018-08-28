import {Column, Entity, PrimaryGeneratedColumn} from 'typeorm'
import {Serializable} from '../TypeOrmDecorators'
import TimestampedSoftDelete from "../base/TimestampedSoftDelete";
import SnakeSerializable from "../interfaces/SnakeSerializable";
import ConditionTag from "./ConditionTag";
import {mapFromSnakeJSON} from "../../services/JSONUtil";
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

  fromSnakeJSON (json: any) {
    mapFromSnakeJSON(this, json, {
      conditionTag: {
        constructor: ConditionTag,
        jsonKey: 'condition'
      }
    })
    return super.fromSnakeJSON(json)
  }
}
