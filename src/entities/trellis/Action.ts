import {Column, PrimaryGeneratedColumn} from 'typeorm'
import TimestampedSoftDelete from '../base/TimestampedSoftDelete'
import {assignJSONProps} from "../../services/JSONUtil";

export default class Action extends TimestampedSoftDelete {
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
    assignJSONProps(this, json)
    return this
  }
}
