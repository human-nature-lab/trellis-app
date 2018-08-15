import {Column, PrimaryGeneratedColumn} from "typeorm";
import TimestampedSoftDelete from "../base/TimestampedSoftDelete";
import SnakeSerializable from "../interfaces/SnakeSerializable";

export default class SectionConditionTag extends TimestampedSoftDelete implements SnakeSerializable{
  @PrimaryGeneratedColumn()
  id: string;
  @Column()
  sectionId: string
  @Column()
  conditionId: string
  @Column()
  surveyId: string
  @Column({ type: 'integer' })
  repetition: number
  @Column()
  followUpDatumId: string
  @Column()
  interviewId: string
}
