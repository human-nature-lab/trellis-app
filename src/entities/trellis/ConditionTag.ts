import {Entity, Column, PrimaryGeneratedColumn} from 'typeorm'
import TimestampedSoftDelete from '../base/TimestampedSoftDelete'
import {mapPropsFromJSON} from "../../services/JSONUtil";

@Entity()
export default class ConditionTag extends TimestampedSoftDelete {
  @PrimaryGeneratedColumn()
  id: string
  @Column()
  name: string

  fromSnakeJSON(json: object) {
    mapPropsFromJSON(this, json, ['id', 'name', 'created_at', 'updated_at', 'deleted_at'])
    return this
 }
}
