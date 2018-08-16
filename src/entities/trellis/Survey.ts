import {Entity, Column, PrimaryGeneratedColumn} from 'typeorm'
import {Serializable} from '../TypeOrmDecorators'
import TimestampedSoftDelete from '../base/TimestampedSoftDelete'
import {mapFromSnakeJSON} from "../../services/JSONUtil";
import Respondent from "./Respondent";
import Form from "./Form";
import Interview from "./Interview";

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

  form: Form
  respondent: Respondent
  interviews: Interview[]

  fromSnakeJSON(json: any) {
    mapFromSnakeJSON(this, json, {
      form: Form,
      respondent: Respondent,
      interviews: Interview
    })
    super.fromSnakeJSON(json)
    return this
 }
}
