import {Entity, Column, PrimaryGeneratedColumn, ManyToOne} from 'typeorm'
import {Serializable, enumerable, Relationship} from '../WebOrmDecorators'
import TimestampedSoftDelete from '../base/TimestampedSoftDelete'
import Locale from "./Locale";
import Translation from './Translation'

@Entity()
export default class TranslationText extends TimestampedSoftDelete {
  @PrimaryGeneratedColumn() @Serializable
  id: string
  @Column() @Serializable
  translationId: string
  @Column({ nullable: true }) @Serializable
  localeId: string
  @Column('text') @Serializable
  translatedText: string

  @Relationship(Locale)
  locale: Locale

  @ManyToOne(type => Translation, translation => translation.translationText)
  translation: Translation

}
