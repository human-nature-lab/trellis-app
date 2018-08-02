import {Entity, Column, PrimaryGeneratedColumn} from 'typeorm'
import TimestampedSoftDelete from '../base/TimestampedSoftDelete'
import {assignJSONProps} from "../../services/JSONUtil";

@Entity()
export default class FormSkip extends TimestampedSoftDelete {
  @PrimaryGeneratedColumn()
  id: string
  @Column()
  formId: string
  @Column()
  skipId: string

  fromJSON(json: object) {
    assignJSONProps(this, json)
  }
}
