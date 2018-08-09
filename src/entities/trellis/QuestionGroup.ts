import {Entity, Column, PrimaryGeneratedColumn} from 'typeorm'
import TimestampedSoftDelete from '../base/TimestampedSoftDelete'
import {mapPropsFromJSON, mapFromJSON} from "../../services/JSONUtil";
import Question from "./Question";
import SectionQuestionGroup from "./SectionQuestionGroup";

@Entity()
export default class QuestionGroup extends TimestampedSoftDelete {
  @PrimaryGeneratedColumn()
  id: string

  questions: Question[]
  sectionQuestionGroup: SectionQuestionGroup

  fromJSON(json: object) {
    mapPropsFromJSON(this, json)
    mapFromJSON(this, json, {
      questions: Question,
      sectionQuestionGroup: {
        constructor: SectionQuestionGroup,
        jsonKey: 'pivot'
      }
    })
    return this
 }
}
