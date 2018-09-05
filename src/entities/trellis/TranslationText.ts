import {Entity, Column, PrimaryGeneratedColumn, ManyToOne} from 'typeorm'
import {Serializable, enumerable, Relationship} from '../decorators/WebOrmDecorators'
import BareTimestampedSoftDelete from '../base/BareTimestampedSoftDelete'
import Locale from "./Locale";
import Translation from './Translation'

@Entity()
export default class TranslationText extends BareTimestampedSoftDelete {
  @PrimaryGeneratedColumn() @Serializable
  id: string
  @Column({ select: false }) @Serializable
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
