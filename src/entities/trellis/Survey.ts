import { Entity, Column, PrimaryGeneratedColumn, OneToMany, OneToOne, JoinColumn, ManyToOne } from 'typeorm'
import { Relationship, Serializable } from '../decorators/WebOrmDecorators'
import TimestampedSoftDelete from '../base/TimestampedSoftDelete'
import Respondent from './Respondent'
import Form from './Form'
import Interview from './Interview'
import MomentTransformer from '../base/MomentTransformer'
import { Moment } from 'moment'

@Entity()
export default class Survey extends TimestampedSoftDelete {
  @PrimaryGeneratedColumn('uuid') @Serializable
  id: string
  @Column() @Serializable
  respondentId: string
  @Column() @Serializable
  formId: string
  @Column() @Serializable
  studyId: string
  @Column({ nullable: true }) @Serializable
  lastQuestionId: string
  @Column({ type: 'datetime', nullable: true, transformer: MomentTransformer}) @Serializable
  completedAt: Moment

  @Relationship(type => Form)
  @OneToOne(type => Form)
  @JoinColumn()
  form: Form

  @Relationship(type => Respondent)
  @ManyToOne(type => Respondent, respondent => respondent.surveys)
  respondent: Respondent

  @Relationship(type => Interview)
  @OneToMany(type => Interview, interview => interview.survey)
  interviews?: Interview[]

}
