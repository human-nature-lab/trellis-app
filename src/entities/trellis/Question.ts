import {Entity, Column, PrimaryGeneratedColumn} from '../TypeOrmDecorators'
import TimestampedSoftDelete from '../base/TimestampedSoftDelete'
import {mapFromSnakeJSON} from "../../services/JSONUtil";
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
