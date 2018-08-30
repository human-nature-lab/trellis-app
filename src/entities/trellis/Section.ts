import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  ManyToMany,
  OneToMany,
  JoinTable,
  OneToOne,
  JoinColumn
} from 'typeorm'
import {Relationship, Serializable} from '../decorators/WebOrmDecorators'
import TimestampedSoftDelete from '../base/TimestampedSoftDelete'
import {mapFromSnakeJSON} from "../../services/JSONUtil";
import Translation from "./Translation";
import FormSection from "./FormSection";
import QuestionGroup from "./QuestionGroup";
import Form from "./Form";

@Entity()
export default class Section extends TimestampedSoftDelete {
  @PrimaryGeneratedColumn() @Serializable
  id: string
  @Column() @Serializable
  nameTranslationId: string

  @Relationship(Translation)
  @OneToOne(type => Translation, { eager: true })
  @JoinColumn()
  nameTranslation: Translation

  @Relationship(QuestionGroup)
  @ManyToMany(type => QuestionGroup, qg => qg.section, { eager: true })
  @JoinTable({ name: 'section_question_group' })
  questionGroups: QuestionGroup[]

  @Relationship(FormSection)
  @OneToMany(type => FormSection, formSection => formSection.section, { eager: true })
  formSections: FormSection[]

  // Inverse relationship definitions only
  @ManyToMany(type => Form)
  forms: Form[]

  // Assigned by Interview
  maxRepetitions?: number
  isRepeatable?: boolean
  followUpQuestionId?: string

  get pages () {
    return this.questionGroups
  }
}
