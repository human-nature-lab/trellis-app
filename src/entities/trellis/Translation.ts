import {Entity, Column, PrimaryGeneratedColumn} from 'typeorm'
import {enumerable, Relationship, Serializable} from '../WebOrmDecorators'
import TimestampedSoftDelete from '../base/TimestampedSoftDelete'
import {mapPropsFromJSON, mapFromSnakeJSON} from "../../services/JSONUtil";
import TranslationText from "./TranslationText";

@Entity()
export default class Translation extends TimestampedSoftDelete {
  @PrimaryGeneratedColumn() @Serializable
  id: string

  @Relationship(TranslationText)
  translationText: TranslationText[]

  @enumerable(false)
  get translation_text () {
    return this.translationText
  }
}
