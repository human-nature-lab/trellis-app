import {Entity, Column, PrimaryGeneratedColumn} from 'typeorm'
import {Serializable} from '../TypeOrmDecorators'
import TimestampedSoftDelete from '../base/TimestampedSoftDelete'
import {mapFromSnakeJSON} from "../../services/JSONUtil";
import Translation from "./Translation";
import FormSection from "./FormSection";
import QuestionGroup from "./QuestionGroup";

@Entity()
export default class Section extends TimestampedSoftDelete {
  @PrimaryGeneratedColumn() @Serializable
  id: string
  @Column() @Serializable
  nameTranslationId: string

  nameTranslation: Translation
  questionGroups: Array<QuestionGroup>
  formSections: Array<FormSection>

  fromSnakeJSON(json: object) {
    mapFromSnakeJSON(this, json, {
      nameTranslation: Translation,
      questionGroups: QuestionGroup,
      formSections: FormSection
    })
    super.fromSnakeJSON(json)
    return this
 }
}
