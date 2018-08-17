import {Entity, Column, PrimaryGeneratedColumn} from 'typeorm'
import {Serializable} from '../TypeOrmDecorators'
import TimestampedSoftDelete from '../base/TimestampedSoftDelete'
import Choice from "./Choice";
import {mapFromSnakeJSON} from "../../services/JSONUtil";

@Entity()
export default class QuestionChoice extends TimestampedSoftDelete {
  @PrimaryGeneratedColumn() @Serializable
  id: string
  @Column() @Serializable
  questionId: string
  @Column() @Serializable
  choiceId: string
  @Column({ type: 'integer' }) @Serializable
  sortOrder: number

  choice: Choice

  fromSnakeJSON (json: any) {
    if (json.pivot) {
      this.choice = new Choice().fromSnakeJSON(json)
      super.fromSnakeJSON(json.pivot)
    } else {
      mapFromSnakeJSON(this, json, {
        choice: Choice
      })
      super.fromSnakeJSON(json)
    }
    return this
  }
}
