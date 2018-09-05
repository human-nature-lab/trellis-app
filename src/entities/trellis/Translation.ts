import {Entity, Column, PrimaryGeneratedColumn, OneToMany} from 'typeorm'
import {enumerable, Relationship, Serializable} from '../decorators/WebOrmDecorators'
import TranslationText from "./TranslationText";
import BareTimestampedSoftDelete from "../base/BareTimestampedSoftDelete";

@Entity()
export default class Translation extends BareTimestampedSoftDelete {
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
