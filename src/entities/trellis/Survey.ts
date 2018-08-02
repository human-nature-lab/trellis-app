import {Entity, Column, PrimaryGeneratedColumn} from 'typeorm'
import TimestampedSoftDelete from '../base/TimestampedSoftDelete'
import {mapPropsFromJSON, mapFromJSON} from "../../services/JSONUtil";
import Respondent from "./Respondent";
import Form from "./Form";

@Entity()
export default class Survey extends TimestampedSoftDelete {
  @PrimaryGeneratedColumn()
  id: string
  @Column()
  respondentId: string
  @Column()
  formId: string
  @Column()
  studyId: string
  @Column({ nullable: true })
  lastQuestionId: string
  @Column({ type: 'datetime', nullable: true})
  completedAt: Date

  form: Form
  respondent: Respondent

  fromJSON(json: any) {
    mapPropsFromJSON(this, json)
    mapFromJSON(this, json, {
      'form': Form,
      'respondent': Respondent
    })
    return this
 }
}
