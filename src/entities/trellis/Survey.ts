import {Entity, Column, PrimaryGeneratedColumn, OneToMany, OneToOne, JoinColumn} from 'typeorm'
import {Relationship, Serializable} from '../WebOrmDecorators'
import TimestampedSoftDelete from '../base/TimestampedSoftDelete'
import Respondent from './Respondent'
import Form from './Form'
import Interview from './Interview'
import {mapFromSnakeJSON} from "../../services/JSONUtil";

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
  @Column({ type: 'datetime', nullable: true}) @Serializable
  completedAt: Date

  @Relationship(Form)
  // @OneToOne(type => Form, { eager: true })
  // @JoinColumn()
  form: Form

  @Relationship(Respondent)
  // @OneToOne(type => Respondent, { eager: true })
  // @JoinColumn()
  respondent: Respondent

  // @Relationship(Interview)
  @OneToMany(type => Interview, interview => interview.survey, { eager: true })
  interviews?: Interview[]

  fromSnakeJSON (json) {
    mapFromSnakeJSON(this, json, {
      interviews: Interview
    })
    return super.fromSnakeJSON(json)
  }

}
