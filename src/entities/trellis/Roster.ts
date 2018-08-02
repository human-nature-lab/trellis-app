import {Entity, Column, PrimaryGeneratedColumn} from 'typeorm'
import TimestampedSoftDelete from '../base/TimestampedSoftDelete'
import {assignJSONProps} from "../../services/JSONUtil";

@Entity()
export default class Roster extends TimestampedSoftDelete {
  @PrimaryGeneratedColumn()
  id: string
  @Column({ type: 'text' })
  val: string

  fromJSON(json: object) {
    assignJSONProps(this, json)
  }
}
