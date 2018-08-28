import {Entity, Column, PrimaryGeneratedColumn} from 'typeorm'
import {Relationship, Serializable} from '../WebOrmDecorators'
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

  @Relationship(Translation)
  nameTranslation: Translation
  @Relationship(QuestionGroup)
  questionGroups: QuestionGroup[]
  @Relationship(FormSection)
  formSections: FormSection[]

  maxRepetitions?: number
  isRepeatable?: boolean
  followUpQuestionId?: string

  get pages () {
    return this.questionGroups
  }
}
