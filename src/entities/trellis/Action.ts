import {Column, PrimaryGeneratedColumn} from 'typeorm'
import TimestampedSoftDelete from '../base/TimestampedSoftDelete'
import {mapCamelToPlain, mapPropsFromJSON} from "../../services/JSONUtil";
import ToSnakeJSON from "../interfaces/ToSnakeJSON";
import FromJSON from "../interfaces/FromJSON";

export default class Action extends TimestampedSoftDelete implements FromJSON, ToSnakeJSON {
  @PrimaryGeneratedColumn()
  id: string
  @Column()
  surveyId: string
  @Column()
  questionId: string
  @Column({ type: 'text' })
  payload: string
  @Column()
  actionType: string
  @Column()
  interviewId: string
  @Column({ type: 'integer' })
  sectionFollowUpRepetition: number
  @Column({ type: 'integer' })
  sectionRepetition: number

  fromJSON(json: object) {
    mapPropsFromJSON(this, json)
    return this
  }

  toSnakeJSON () {
    let json = mapCamelToPlain(this, true)
    json['payload'] = this.payload // We don't do any case transformation for this
    return json
  }

}
