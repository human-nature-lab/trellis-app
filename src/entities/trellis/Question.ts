import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToOne,
  OneToMany,
  JoinTable,
  ManyToMany,
  JoinColumn
} from 'typeorm'
import { Relationship, Serializable } from '../decorators/WebOrmDecorators'
import SparseTimestampedSoftDelete from '../base/SparseTimestampedSoftDelete'
import QuestionType from './QuestionType'
import Translation from './Translation'
import AssignConditionTag from './AssignConditionTag'
import QuestionParameter from './QuestionParameter'
import QuestionChoice from './QuestionChoice'
import QuestionDatum from './QuestionDatum'
import QuestionGroup from './QuestionGroup'
import QT from '../../static/question.types'

@Entity()
export default class Question extends SparseTimestampedSoftDelete {
  @PrimaryGeneratedColumn() @Serializable
  id: string
  @Column() @Serializable
  questionTypeId: string
  @Column({ select: false }) @Serializable
  questionTranslationId: string
  @Column() @Serializable
  questionGroupId: string
  @Column({ type: 'tinyint' }) @Serializable
  sortOrder: number
  @Column() @Serializable
  varName: string

  @Relationship(type => QuestionType)
  @ManyToOne(type => QuestionType, qt => qt.questions, {eager: true})
  questionType: QuestionType

  @Relationship(type => Translation)
  @OneToOne(type => Translation, { eager: true })
  @JoinColumn()
  questionTranslation: Translation

  @Relationship(type => QuestionChoice)
  @OneToMany(type => QuestionChoice, choice => choice.question, { eager: true })
  choices: QuestionChoice[]

  @Relationship(type => AssignConditionTag)
  @ManyToMany(type => AssignConditionTag, act => act.questions, { eager: true })
  @JoinTable({ name: 'question_assign_condition_tag' })
  assignConditionTags: AssignConditionTag[]

  @Relationship(type => QuestionParameter)
  @OneToMany(type => QuestionParameter, qp => qp.question, { eager: true })
  questionParameters: QuestionParameter[]

  // Inverse relationships
  @ManyToOne(type => QuestionGroup, qg => qg.questions)
  questionGroup: QuestionGroup

  datum?: QuestionDatum           // Assigned and used by InterviewManager only
  parameters?: object             // Assigned and used by InterviewManager only

  fromSnakeJSON(json: any) {
    super.fromSnakeJSON(json)
    this.sortOrder = +this.sortOrder
    return this
 }
}
