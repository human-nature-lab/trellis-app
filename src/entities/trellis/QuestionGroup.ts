import {Entity, Column, PrimaryGeneratedColumn} from 'typeorm'
import {Serializable} from '../TypeOrmDecorators'
import TimestampedSoftDelete from '../base/TimestampedSoftDelete'
import {mapFromSnakeJSON} from "../../services/JSONUtil";
import Question from "./Question";
import SectionQuestionGroup from "./SectionQuestionGroup";
import Skip from "./Skip";

@Entity()
export default class QuestionGroup extends TimestampedSoftDelete {
  @PrimaryGeneratedColumn() @Serializable
  id: string

  questions: Question[]
  sectionQuestionGroup: SectionQuestionGroup
  skips: Skip[]

  fromSnakeJSON(json: object) {
    mapFromSnakeJSON(this, json, {
      questions: Question,
      skips: Skip,
      sectionQuestionGroup: {
        constructor: SectionQuestionGroup,
        jsonKey: 'pivot'
      }
    })
    super.fromSnakeJSON(json)
    return this
 }
}
