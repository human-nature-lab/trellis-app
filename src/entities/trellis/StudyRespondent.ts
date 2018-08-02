import {Entity, Column, PrimaryGeneratedColumn} from 'typeorm'
import TimestampedSoftDelete from '../base/TimestampedSoftDelete'
import {assignJSONProps} from "../../services/JSONUtil";

@Entity()
export default class StudyRespondent extends TimestampedSoftDelete {
  @PrimaryGeneratedColumn()
  id: string
  @Column()
  studyId: string
  @Column()
  respondentId: string

  fromJSON(json: object) {
    assignJSONProps(this, json)
  }
}
