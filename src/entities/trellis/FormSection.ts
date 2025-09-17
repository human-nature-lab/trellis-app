import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm'
import { Serializable } from '../decorators/WebOrmDecorators'
import Section from './Section'
import SparseTimestampedSoftDelete from '../base/SparseTimestampedSoftDelete'

@Entity()
export default class FormSection extends SparseTimestampedSoftDelete {
  @PrimaryGeneratedColumn('uuid') @Serializable
  id: string

  @Column({ select: true, type: 'uuid' }) @Serializable
  formId: string

  @Column({ select: false, type: 'uuid' }) @Serializable
  sectionId: string

  @Column({ type: 'integer' }) @Serializable
  sortOrder: number

  @Column('boolean') @Serializable
  isRepeatable: boolean

  @Column('integer') @Serializable
  maxRepetitions: number

  @Column({ nullable: true, type: 'uuid' }) @Serializable
  repeatPromptTranslationId: string

  @Column({ nullable: true, type: 'uuid' }) @Serializable
  followUpQuestionId: string

  @Column('boolean') @Serializable
  randomizeFollowUp: boolean

  @Serializable // @Column('boolean')
  randomizePages: boolean

  @ManyToOne(type => Section, section => section.formSections)
  section: Section

  fromSnakeJSON (json: any) {
    super.fromSnakeJSON(json)
    this.sortOrder = +this.sortOrder
    this.isRepeatable = !!+this.isRepeatable
    this.maxRepetitions = +this.maxRepetitions
    return this
  }
}
