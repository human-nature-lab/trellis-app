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
import {Relationship, Serializable} from '../decorators/WebOrmDecorators'
import BareTimestampedSoftDelete from '../base/BareTimestampedSoftDelete'
import {mapFromSnakeJSON} from "../../services/JSONUtil";
import QuestionType from "./QuestionType";
import Translation from "./Translation";
import Choice from "./Choice";
import AssignConditionTag from "./AssignConditionTag";
import QuestionParameter from "./QuestionParameter";
import QuestionChoice from "./QuestionChoice";
import QuestionDatum from "./QuestionDatum";
import QuestionGroup from "./QuestionGroup";

@Entity()
export default class Question extends BareTimestampedSoftDelete {
  @PrimaryGeneratedColumn() @Serializable
  id: string
  @Column({ select: false }) @Serializable
  questionTypeId: string
  @Column({ select: false }) @Serializable
  questionTranslationId: string
  @Column({ select: false }) @Serializable
  questionGroupId: string
  @Column({ type: 'tinyint' }) @Serializable
  sortOrder: number
  @Column() @Serializable
  varName: string

  @Relationship(QuestionType)
  @ManyToOne(type => QuestionType, qt => qt.questions, {eager: true})
  questionType: QuestionType

  @Relationship(Translation)
  @OneToOne(type => Translation, { eager: true })
  @JoinColumn()
  questionTranslation: Translation

  @Relationship(QuestionChoice)
  @OneToMany(type => QuestionChoice, choice => choice.question, { eager: true })
  choices: QuestionChoice[]

  @Relationship(AssignConditionTag)
  @ManyToMany(type => AssignConditionTag, act => act.questions, { eager: true })
  @JoinTable({ name: 'question_assign_condition_tag' })
  assignConditionTags: AssignConditionTag[]

  @Relationship(QuestionParameter)
  @OneToMany(type => QuestionParameter, qp => qp.question, { eager: true })
  questionParameters: QuestionParameter[]

  datum?: QuestionDatum           // Assigned and used by InterviewManager only
  parameters?: object             // Assigned and used by InterviewManager only

  fromSnakeJSON(json: any) {
    super.fromSnakeJSON(json)
    this.sortOrder = +this.sortOrder
    return this
 }
}
