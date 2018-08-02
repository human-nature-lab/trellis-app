import {Column, PrimaryGeneratedColumn} from "typeorm";
import TimestampedSoftDelete from "../base/TimestampedSoftDelete";
import {assignJSONProps} from "../../services/JSONUtil";

export default class SurveyConditionTag extends TimestampedSoftDelete {
  @PrimaryGeneratedColumn()
  id: string;
  @Column()
  surveyId: string
  @Column()
  conditionId: string
  @Column()
  interviewId: string

  fromJSON (json: object) {
    assignJSONProps(this, json)
    return this
  }
}
