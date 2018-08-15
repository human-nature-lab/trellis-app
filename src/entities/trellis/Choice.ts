import {Entity, Column, PrimaryGeneratedColumn} from '../TypeOrmDecorators'
import TimestampedSoftDelete from '../base/TimestampedSoftDelete'
import {mapFromSnakeJSON} from "../../services/JSONUtil";
import Translation from "./Translation";

@Entity()
export default class Choice extends TimestampedSoftDelete {
  @PrimaryGeneratedColumn()
  id: string
  @Column()
  choiceTranslationId: string
  @Column()
  val: string

  choiceTranslation: Translation

  fromSnakeJSON(json: object) {
    mapFromSnakeJSON(this, json, {
      choiceTranslation: Translation
    })
    super.fromSnakeJSON(json)
    return this
  }
}
