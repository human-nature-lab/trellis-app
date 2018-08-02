import {Entity, Column, PrimaryGeneratedColumn} from 'typeorm'
import TimestampedSoftDelete from '../base/TimestampedSoftDelete'
import {mapPropsFromJSON} from "../../services/JSONUtil";

@Entity()
export default class Roster extends TimestampedSoftDelete {
  @PrimaryGeneratedColumn()
  id: string
  @Column({ type: 'text' })
  val: string

  fromJSON(json: object) {
    mapPropsFromJSON(this, json)
    return this
 }
}
