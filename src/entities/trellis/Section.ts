import {Entity, Column, PrimaryGeneratedColumn} from 'typeorm'
import TimestampedSoftDelete from '../base/TimestampedSoftDelete'
import {mapPropsFromJSON, mapFromSnakeJSON} from "../../services/JSONUtil";
import Translation from "./Translation";
import FormSection from "./FormSection";
import QuestionGroup from "./QuestionGroup";

@Entity()
export default class Section extends TimestampedSoftDelete {
  @PrimaryGeneratedColumn()
  id: string
  @Column()
  nameTranslationId: string

  nameTranslation: Translation
  questionGroups: Array<QuestionGroup>
  formSections: Array<FormSection>

  fromSnakeJSON(json: object) {
    mapPropsFromJSON(this, json)
    mapFromSnakeJSON(this, json, {
      nameTranslation: Translation,
      questionGroups: QuestionGroup,
      formSections: FormSection
    })
    super.fromSnakeJSON(json)
    return this
 }
}
