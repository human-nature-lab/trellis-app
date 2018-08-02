import {Entity, Column, PrimaryGeneratedColumn} from 'typeorm'
import TimestampedSoftDelete from '../base/TimestampedSoftDelete'
import {assignJSONProps} from "../../services/JSONUtil";

@Entity()
export default class QuestionAssignConditionTag extends TimestampedSoftDelete {
  @PrimaryGeneratedColumn()
  id: string
  @Column()
  questionId: string
  @Column()
  assignConditionTagId: string

  fromJSON(json: object) {
    assignJSONProps(this, json)
  }
}
