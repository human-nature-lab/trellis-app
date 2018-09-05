import {Entity, Column, PrimaryGeneratedColumn, ManyToOne} from 'typeorm'
import {Serializable} from '../decorators/WebOrmDecorators'
import Section from "./Section";
import BareTimestampedSoftDelete from "../base/BareTimestampedSoftDelete";

@Entity()
export default class FormSection extends BareTimestampedSoftDelete {
  @PrimaryGeneratedColumn() @Serializable
  id: string
  @Column({select: false}) @Serializable
  formId: string
  @Column({select: false}) @Serializable
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
