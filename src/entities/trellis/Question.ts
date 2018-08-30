import {Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToOne, OneToMany, JoinTable} from 'typeorm'
import {Relationship, Serializable} from '../decorators/WebOrmDecorators'
import TimestampedSoftDelete from '../base/TimestampedSoftDelete'
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
export default class Question extends TimestampedSoftDelete {
  @PrimaryGeneratedColumn() @Serializable
  id: string
  @Column() @Serializable
  questionTypeId: string
  @Column() @Serializable
  questionTranslationId: string
  @Column() @Serializable
  questionGroupId: string
  @Column({ type: 'tinyint' }) @Serializable
  sortOrder: number
  @Column() @Serializable
  varName: string

  @Relationship(QuestionType)
  // @ManyToOne(type => QuestionType, qt => qt.questions, {eager: true})
  questionType: QuestionType

  @Relationship(Translation)
  // @OneToOne(type => Translation, { eager: true })
  questionTranslation: Translation

  @Relationship(QuestionChoice)
  @OneToMany(type => QuestionChoice, choice => choice.question, { eager: true })
  choices: QuestionChoice[]

  @Relationship(AssignConditionTag)
  // @ManyToMany(type => AssignConditionTag, act => act.question, { eager: true })
  // @JoinTable({ name: 'question_assign_condition_tag' })
  assignConditionTags: AssignConditionTag[]

  @Relationship(QuestionParameter)
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
