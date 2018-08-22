import {Entity, Column, PrimaryGeneratedColumn} from 'typeorm'
import {Relationship, Serializable} from '../WebOrmDecorators'
import TimestampedSoftDelete from '../base/TimestampedSoftDelete'
import Respondent from './Respondent'
import Form from './Form'
import Interview from './Interview'
import {mapFromSnakeJSON} from "../../services/JSONUtil";

@Entity()
export default class Survey extends TimestampedSoftDelete {
  @PrimaryGeneratedColumn() @Serializable
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
  form: Form
  @Relationship(Respondent)
  respondent: Respondent
  // @Relationship(Interview)
  interviews?: Interview[]

  fromSnakeJSON (json) {
    mapFromSnakeJSON(this, json, {
      interviews: Interview
    })
    return super.fromSnakeJSON(json)
  }

}
