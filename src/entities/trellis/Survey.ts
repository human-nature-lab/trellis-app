import {Entity, Column, PrimaryGeneratedColumn} from 'typeorm'
import TimestampedSoftDelete from '../base/TimestampedSoftDelete'
import {assignJSONProps} from "../../services/JSONUtil";

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

  fromJSON(json: object) {
    assignJSONProps(this, json)
  }
}
