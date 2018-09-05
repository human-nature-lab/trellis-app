import {Entity, JoinColumn, JoinTable, ManyToMany, OneToMany, OneToOne, PrimaryGeneratedColumn} from 'typeorm'
import {Relationship, Serializable} from '../decorators/WebOrmDecorators'
import BareTimestampedSoftDelete from '../base/BareTimestampedSoftDelete'
import Question from "./Question";
import SectionQuestionGroup from "./SectionQuestionGroup";
import Skip from "./Skip";
import Section from "./Section";

@Entity()
export default class QuestionGroup extends BareTimestampedSoftDelete {
  @PrimaryGeneratedColumn() @Serializable
  id: string

  @Relationship({ constructor: Question })
  questions: Question[]

  @Relationship({ constructor: SectionQuestionGroup, jsonKey: 'pivot' })
  @OneToOne(type => SectionQuestionGroup, sqg => sqg.questionGroup, { eager: true })
  sectionQuestionGroup: SectionQuestionGroup

  @Relationship(Skip)
  @ManyToMany(type => Skip, skip => skip.questionGroups, { eager: true })
  @JoinTable({ name: 'question_group_skip' })
  skips: Skip[]

  // Inverse relationships only
  @ManyToMany(type => Section, section => section.questionGroups)
  section: Section

}
