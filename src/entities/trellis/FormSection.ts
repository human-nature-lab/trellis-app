import {Entity, Column, PrimaryGeneratedColumn} from 'typeorm'
import {Serializable} from '../TypeOrmDecorators'
import TimestampedSoftDelete from '../base/TimestampedSoftDelete'

@Entity()
export default class FormSection extends TimestampedSoftDelete {
  @PrimaryGeneratedColumn() @Serializable
  id: string
  @Column() @Serializable
  formId: string
  @Column() @Serializable
  sectionId: string
  @Column({type: 'integer'}) @Serializable
  sortOrder: number
  @Column() @Serializable
  isRepeatable: boolean
  @Column() @Serializable
  maxRepetitions: number
  @Column({ nullable: true }) @Serializable
  repeatPromptTranslationid: string
  @Column({ nullable: true }) @Serializable
  followUpQuestionid: string
}
