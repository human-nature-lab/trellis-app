import {Column, PrimaryGeneratedColumn} from "typeorm";
import TimestampedSoftDelete from "../base/TimestampedSoftDelete";
import SnakeSerializable from "../interfaces/SnakeSerializable";

export default class SurveyConditionTag extends TimestampedSoftDelete implements SnakeSerializable {
  @PrimaryGeneratedColumn()
  id: string;
  @Column()
  surveyId: string
  @Column()
  conditionId: string
  @Column()
  interviewId: string
}
