import {Entity, Column, PrimaryGeneratedColumn} from 'typeorm'
import TimestampedSoftDelete from '../base/TimestampedSoftDelete'
import {mapPropsFromJSON} from "../../services/JSONUtil";

@Entity()
export default class QuestionAssignConditionTag extends TimestampedSoftDelete {
  @PrimaryGeneratedColumn()
  id: string
  @Column()
  questionId: string
  @Column()
  assignConditionTagId: string

  fromJSON(json: object) {
    mapPropsFromJSON(this, json)
    return this
 }
}
