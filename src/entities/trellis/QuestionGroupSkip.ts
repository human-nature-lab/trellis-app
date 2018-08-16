import {Entity, Column, PrimaryGeneratedColumn} from 'typeorm'
import {Serializable} from '../TypeOrmDecorators'
import TimestampedSoftDelete from '../base/TimestampedSoftDelete'
import Skip from "./Skip";
import {mapFromSnakeJSON} from "../../services/JSONUtil";

@Entity()
export default class QuestionGroupSkip extends TimestampedSoftDelete {
  @PrimaryGeneratedColumn() @Serializable
  id: string
  @Column() @Serializable
  questionGroupId: string
  @Column() @Serializable
  skipId: string

  skip: Skip

  fromSnakeJSON (json: any) {
    mapFromSnakeJSON(this, json, {
      skip: Skip
    })
    return super.fromSnakeJSON(json)
  }
}
