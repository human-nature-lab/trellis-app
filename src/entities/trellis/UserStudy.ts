import {Entity, Column, PrimaryGeneratedColumn} from 'typeorm'
import TimestampedSoftDelete from '../base/TimestampedSoftDelete'
import {assignJSONProps} from "../../services/JSONUtil";

@Entity()
export default class UserStudy extends TimestampedSoftDelete {
  @PrimaryGeneratedColumn()
  id: string
  @Column()
  userId: string
  @Column()
  studyId: string

  fromJSON(json: object) {
    assignJSONProps(this, json)
  }
}
