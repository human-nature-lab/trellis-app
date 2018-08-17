import {Entity, Column, PrimaryGeneratedColumn} from 'typeorm'
import {Serializable} from '../TypeOrmDecorators'
import TimestampedSoftDelete from '../base/TimestampedSoftDelete'
import {mapFromSnakeJSON} from "../../services/JSONUtil";
import Translation from "./Translation";

@Entity()
export default class Choice extends TimestampedSoftDelete {
  @PrimaryGeneratedColumn() @Serializable
  id: string
  @Column() @Serializable
  choiceTranslationId: string
  @Column() @Serializable
  val: string

  choiceTranslation: Translation

  parameters?: object // Assigned and used by InterviewManager

  fromSnakeJSON(json: object) {
    mapFromSnakeJSON(this, json, {
      choiceTranslation: Translation
    })
    super.fromSnakeJSON(json)
    return this
  }
}
