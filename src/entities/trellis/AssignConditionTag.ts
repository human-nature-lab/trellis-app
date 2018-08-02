import {Entity, Column, PrimaryGeneratedColumn} from 'typeorm'
import TimestampedSoftDelete from '../base/TimestampedSoftDelete'
import {mapPropsFromJSON} from "../../services/JSONUtil";

@Entity()
export default class AssignConditionTag extends TimestampedSoftDelete {
  @PrimaryGeneratedColumn()
  id: string
  @Column()
  conditionTagId: string
  @Column({ type: 'text' })
  logic: string
  @Column({nullable: true})
  scope: string

  fromJSON(json: object) {
    mapPropsFromJSON(this, json)
    return this
 }
}
