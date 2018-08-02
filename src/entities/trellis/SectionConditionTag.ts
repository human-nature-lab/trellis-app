import {Column, PrimaryGeneratedColumn} from "typeorm";
import TimestampedSoftDelete from "../base/TimestampedSoftDelete";
import {assignJSONProps} from "../../services/JSONUtil";

export default class SectionConditionTag extends TimestampedSoftDelete {
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

  fromJSON (json: object) {
    assignJSONProps(this, json)
    return this
  }
}
