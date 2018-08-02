import {Column, PrimaryGeneratedColumn} from "typeorm";
import TimestampedSoftDelete from "../base/TimestampedSoftDelete";
import {mapPropsFromJSON} from "../../services/JSONUtil";

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
    mapPropsFromJSON(this, json)
    return this
  }
}
