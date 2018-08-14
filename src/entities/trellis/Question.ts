import {Entity, Column, PrimaryGeneratedColumn} from 'typeorm'
import TimestampedSoftDelete from '../base/TimestampedSoftDelete'
import {mapFromSnakeJSON, mapPropsFromJSON} from "../../services/JSONUtil";
import QuestionType from "./QuestionType";
import Translation from "./Translation";
import Choice from "./Choice";
import AssignConditionTag from "./AssignConditionTag";

@Entity()
export default class Question extends TimestampedSoftDelete {
  @PrimaryGeneratedColumn()
  id: string
  @Column()
  questionTypeId: string
  @Column()
  questionTranslationId: string
  @Column()
  questionGroupId: string
  @Column({ type: 'tinyint' })
  sortOrder: number
  @Column()
  varName: string

  questionType: QuestionType
  questionTranslation: Translation
  choices: Choice[]
  assignConditionTags: AssignConditionTag[]

  fromJSON(json: any) {
    mapPropsFromJSON(this, json)
    mapFromSnakeJSON(this, json, {
      questionType: QuestionType,
      questionTranslation: Translation,
      choices: Choice,
      assignConditionTags: AssignConditionTag
    })
    return this
 }
}
