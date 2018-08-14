import {Entity, Column, PrimaryGeneratedColumn} from 'typeorm'
import TimestampedSoftDelete from '../base/TimestampedSoftDelete'
import {mapPropsFromJSON} from "../../services/JSONUtil";

@Entity()
export default class QuestionChoice extends TimestampedSoftDelete {
  @PrimaryGeneratedColumn()
  id: string
  @Column()
  questionId: string
  @Column()
  choiceId: string
  @Column({ type: 'integer' })
  sortOrder: number

  fromSnakeJSON(json: object) {
    mapPropsFromJSON(this, json)
    return this
 }
}
