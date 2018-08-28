import {Entity, Column, PrimaryGeneratedColumn, OneToMany} from 'typeorm'
import {enumerable, Relationship, Serializable} from '../WebOrmDecorators'
import TimestampedSoftDelete from '../base/TimestampedSoftDelete'
import {mapPropsFromJSON, mapFromSnakeJSON} from "../../services/JSONUtil";
import TranslationText from "./TranslationText";

@Entity()
export default class Translation extends TimestampedSoftDelete {
  @PrimaryGeneratedColumn() @Serializable
  id: string

  @enumerable(false)
  get translation_text () {
    return this.translationText
  }

  @Relationship(TranslationText)
  @OneToMany(type => TranslationText, translationText => translationText.translation, { eager: true })
  translationText: Array<TranslationText>

}
