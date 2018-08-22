import {Entity, Column, PrimaryGeneratedColumn} from 'typeorm'
import {Relationship, Serializable} from '../WebOrmDecorators'
import TimestampedSoftDelete from '../base/TimestampedSoftDelete'
import {mapFromSnakeJSON} from "../../services/JSONUtil";
import QuestionType from "./QuestionType";
import Translation from "./Translation";
import Choice from "./Choice";
import AssignConditionTag from "./AssignConditionTag";
import QuestionParameter from "./QuestionParameter";
import QuestionChoice from "./QuestionChoice";
import QuestionDatum from "./QuestionDatum";

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
  questionType: QuestionType
  @Relationship(Translation)
  questionTranslation: Translation
  @Relationship(QuestionChoice)
  choices: QuestionChoice[]
  @Relationship(AssignConditionTag)
  assignConditionTags: AssignConditionTag[]
  @Relationship(QuestionParameter)
  questionParameters: QuestionParameter[]

  datum?: QuestionDatum           // Assigned and used by InterviewManager only
  parameters?: object             // Assigned and used by InterviewManager only

  fromSnakeJSON(json: any) {
    super.fromSnakeJSON(json)
    this.sortOrder = +this.sortOrder
    return this
 }
}
