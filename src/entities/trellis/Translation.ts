import {Entity, Column, PrimaryGeneratedColumn} from 'typeorm'
import {Serializable} from '../TypeOrmDecorators'
import TimestampedSoftDelete from '../base/TimestampedSoftDelete'
import {mapPropsFromJSON, mapFromSnakeJSON} from "../../services/JSONUtil";
import TranslationText from "./TranslationText";

@Entity()
export default class Translation extends TimestampedSoftDelete {
  @PrimaryGeneratedColumn() @Serializable
  id: string

  translationText: Array<TranslationText>

  get translation_text () {
    return this.translationText
  }

  toJSON () {
    return this
  }

  fromSnakeJSON (json: any) {
    mapFromSnakeJSON(this, json, {
      translationText: TranslationText
    })
    super.fromSnakeJSON(json)
    return this
  }
}
