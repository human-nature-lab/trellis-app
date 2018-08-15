import {Column, PrimaryGeneratedColumn} from "typeorm";
import TimestampedSoftDelete from "../base/TimestampedSoftDelete";
import {mapCamelToPlain, mapPropsFromJSON} from "../../services/JSONUtil";
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

  toSnakeJSON () {
    return mapCamelToPlain(this)
  }

  fromSnakeJSON (json: object) {
    mapPropsFromJSON(this, json)
    super.fromSnakeJSON(json)
    return this
  }
}
