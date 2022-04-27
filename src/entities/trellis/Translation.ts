import { Entity, PrimaryGeneratedColumn, OneToMany } from 'typeorm'
import { enumerable, Relationship, Serializable } from '../decorators/WebOrmDecorators'
import TranslationText from './TranslationText'
import SparseTimestampedSoftDelete from '../base/SparseTimestampedSoftDelete'

@Entity()
export default class Translation extends SparseTimestampedSoftDelete {
  @PrimaryGeneratedColumn('uuid') @Serializable
  id: string

  @enumerable(false)
  get translation_text () {
    return this.translationText
  }

  @Relationship(type => TranslationText)
  @OneToMany(type => TranslationText, translationText => translationText.translation)
  translationText: Array<TranslationText>
}
