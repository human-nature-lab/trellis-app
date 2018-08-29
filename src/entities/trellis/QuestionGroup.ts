import {Entity, JoinTable, ManyToMany, ManyToOne, PrimaryGeneratedColumn} from 'typeorm'
import {Relationship, Serializable} from '../WebOrmDecorators'
import TimestampedSoftDelete from '../base/TimestampedSoftDelete'
import Question from "./Question";
import SectionQuestionGroup from "./SectionQuestionGroup";
import Skip from "./Skip";
import Section from "./Section";

@Entity()
export default class QuestionGroup extends TimestampedSoftDelete {
  @PrimaryGeneratedColumn() @Serializable
  id: string

  @Relationship(Question)
  questions: Question[]

  @Relationship({
    constructor: SectionQuestionGroup,
    jsonKey: 'pivot'
  })
  sectionQuestionGroup: SectionQuestionGroup

  @Relationship(Skip)
  @ManyToMany(type => Skip, skip => skip.questionGroups, { eager: true })
  @JoinTable({ name: 'question_group_skip' })
  skips: Skip[]

  // Inverse relationships only
  @ManyToMany(type => Section, section => section.questionGroups)
  section: Section

}
