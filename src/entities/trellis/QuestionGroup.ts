import {Entity, Column, PrimaryGeneratedColumn} from 'typeorm'
import TimestampedSoftDelete from '../base/TimestampedSoftDelete'
import {mapPropsFromJSON, mapFromSnakeJSON} from "../../services/JSONUtil";
import Question from "./Question";
import SectionQuestionGroup from "./SectionQuestionGroup";

@Entity()
export default class QuestionGroup extends TimestampedSoftDelete {
  @PrimaryGeneratedColumn()
  id: string

  questions: Question[]
  sectionQuestionGroup: SectionQuestionGroup

  fromSnakeJSON(json: object) {
    mapPropsFromJSON(this, json)
    mapFromSnakeJSON(this, json, {
      questions: Question,
      sectionQuestionGroup: {
        constructor: SectionQuestionGroup,
        jsonKey: 'pivot'
      }
    })
    super.fromSnakeJSON(json)
    return this
 }
}
