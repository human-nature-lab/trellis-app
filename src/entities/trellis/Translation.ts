import {Entity, Column, PrimaryGeneratedColumn} from 'typeorm'
import TimestampedSoftDelete from '../base/TimestampedSoftDelete'
import {mapPropsFromJSON, mapFromJSON} from "../../services/JSONUtil";
import TranslationText from "./TranslationText";

@Entity()
export default class Translation extends TimestampedSoftDelete {
  @PrimaryGeneratedColumn()
  id: string

  translationText: Array<TranslationText>

  fromJSON(json: any) {
    mapPropsFromJSON(this, json)
    mapFromJSON(this, json, {
      translationText: TranslationText
    })
    return this
  }
}
