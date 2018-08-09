import {Entity, Column, PrimaryGeneratedColumn} from 'typeorm'
import TimestampedSoftDelete from '../base/TimestampedSoftDelete'
import {mapPropsFromJSON, mapFromJSON} from "../../services/JSONUtil";
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

  fromJSON(json: object) {
    mapPropsFromJSON(this, json)
    mapFromJSON(this, json, {
      choiceTranslation: Translation
    })
    return this
  }
}
