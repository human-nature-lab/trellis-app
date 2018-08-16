import {Column, PrimaryGeneratedColumn} from 'typeorm'
import {Serializable} from '../TypeOrmDecorators'
import TimestampedSoftDelete from "../base/TimestampedSoftDelete";
import SnakeSerializable from "../interfaces/SnakeSerializable";

export default class SurveyConditionTag extends TimestampedSoftDelete implements SnakeSerializable {
  @PrimaryGeneratedColumn() @Serializable
  id: string;
  @Column() @Serializable
  surveyId: string
  @Column() @Serializable
  conditionId: string
  @Column() @Serializable
  interviewId: string
}
