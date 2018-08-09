import {Entity, Column, PrimaryGeneratedColumn} from 'typeorm'
import TimestampedSoftDelete from '../base/TimestampedSoftDelete'
import {mapPropsFromJSON} from "../../services/JSONUtil";

@Entity()
export default class RespondentFill extends TimestampedSoftDelete {
  @PrimaryGeneratedColumn()
  id: string
  @Column()
  respondentId: string
  @Column()
  name: string
  @Column({ type: 'text' })
  val: string

  fromJSON(json: object) {
    mapPropsFromJSON(this, json)
    return this
 }
}
