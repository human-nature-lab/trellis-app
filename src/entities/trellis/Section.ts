import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToMany,
  OneToMany,
  JoinTable,
  OneToOne,
  JoinColumn,
} from 'typeorm'
import { Relationship, Serializable } from '../decorators/WebOrmDecorators'
import Translation from './Translation'
import FormSection from './FormSection'
import QuestionGroup from './QuestionGroup'
import Form from './Form'
import SparseTimestampedSoftDelete from '../base/SparseTimestampedSoftDelete'

@Entity()
export default class Section extends SparseTimestampedSoftDelete {
  @PrimaryGeneratedColumn('uuid') @Serializable
  id: string

  @Column('uuid') @Serializable
  nameTranslationId: string

  @Relationship(type => Translation)
  @OneToOne(type => Translation, { eager: true })
  @JoinColumn()
  nameTranslation: Translation

  @ManyToMany(type => QuestionGroup, qg => qg.section, { eager: true })
  @JoinTable({ name: 'section_question_group' })
  @Relationship(type => QuestionGroup)
  questionGroups: QuestionGroup[]

  @Relationship(type => FormSection)
  @OneToMany(type => FormSection, formSection => formSection.section, { eager: true })
  formSections: FormSection[]

  // Inverse relationship definitions only
  @ManyToMany(type => Form)
  forms: Form[]

  // Assigned by Interview
  maxRepetitions?: number
  isRepeatable?: boolean
  followUpQuestionId?: string

  get pages () {
    return this.questionGroups
  }
}
