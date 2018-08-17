import {Entity, Column, PrimaryGeneratedColumn} from 'typeorm'
import {Serializable} from '../TypeOrmDecorators'
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

  questionType: QuestionType
  questionTranslation: Translation
  choices: QuestionChoice[]
  assignConditionTags: AssignConditionTag[]
  questionParameters: QuestionParameter[]

  datum?: QuestionDatum           // Assigned and used by InterviewManager only
  parameters?: object             // Assigned and used by InterviewManager only

  toJSON () {
    return this
  }

  fromSnakeJSON(json: any) {
    mapFromSnakeJSON(this, json, {
      questionType: QuestionType,
      questionTranslation: Translation,
      choices: QuestionChoice,
      assignConditionTags: AssignConditionTag,
      questionParameters: QuestionParameter
    })
    super.fromSnakeJSON(json)
    this.sortOrder = +this.sortOrder
    return this
 }
}
