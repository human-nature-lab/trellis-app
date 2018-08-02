import {Entity, Column, PrimaryGeneratedColumn} from 'typeorm'
import TimestampedSoftDelete from '../base/TimestampedSoftDelete'
import {assignJSONProps} from "../../services/JSONUtil";

@Entity()
export default class SkipConditionTag extends TimestampedSoftDelete {
  @PrimaryGeneratedColumn()
  id: string
  @Column()
  skipId: string
  @Column()
  conditionTagName: string

  fromJSON(json: object) {
    assignJSONProps(this, json)
  }
}
