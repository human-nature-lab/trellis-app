import {Column, PrimaryGeneratedColumn} from 'typeorm'
import {Serializable} from '../TypeOrmDecorators'
import TimestampedSoftDelete from "../base/TimestampedSoftDelete";
import SnakeSerializable from "../interfaces/SnakeSerializable";

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
}
