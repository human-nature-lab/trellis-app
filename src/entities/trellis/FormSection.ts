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
  repeatPromptTranslationId: string
  @Column({ nullable: true }) @Serializable
  followUpQuestionId: string

  fromSnakeJSON (json: any) {
    super.fromSnakeJSON(json)
    this.sortOrder = +this.sortOrder
    this.isRepeatable = !!+this.isRepeatable
    this.maxRepetitions = +this.maxRepetitions
    return this
  }
}
