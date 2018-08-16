import {Entity, Column, PrimaryGeneratedColumn} from 'typeorm'
import {Serializable} from '../TypeOrmDecorators'
import TimestampedSoftDelete from '../base/TimestampedSoftDelete'
import {mapFromSnakeJSON} from "../../services/JSONUtil";
import QuestionType from "./QuestionType";
import Translation from "./Translation";
import Choice from "./Choice";
import AssignConditionTag from "./AssignConditionTag";

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
  choices: Choice[]
  assignConditionTags: AssignConditionTag[]

  fromSnakeJSON(json: any) {
    mapFromSnakeJSON(this, json, {
      questionType: QuestionType,
      questionTranslation: Translation,
      choices: Choice,
      assignConditionTags: AssignConditionTag
    })
    super.fromSnakeJSON(json)
    return this
 }
}
