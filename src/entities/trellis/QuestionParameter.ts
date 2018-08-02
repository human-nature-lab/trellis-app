import {Entity, Column, PrimaryGeneratedColumn} from 'typeorm'
import TimestampedSoftDelete from '../base/TimestampedSoftDelete'
import {assignJSONProps} from "../../services/JSONUtil";

@Entity()
export default class QuestionParameter extends TimestampedSoftDelete {
  @PrimaryGeneratedColumn()
  id: string
  @Column()
  questionId: string
  @Column()
  parameterId: string
  @Column()
  val: string

  fromJSON(json: object) {
    assignJSONProps(this, json)
  }
}
