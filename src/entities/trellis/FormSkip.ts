import {Entity, Column, PrimaryGeneratedColumn} from 'typeorm'
import TimestampedSoftDelete from '../base/TimestampedSoftDelete'
import {mapPropsFromJSON} from "../../services/JSONUtil";

@Entity()
export default class FormSkip extends TimestampedSoftDelete {
  @PrimaryGeneratedColumn()
  id: string
  @Column()
  formId: string
  @Column()
  skipId: string

  fromJSON(json: object) {
    mapPropsFromJSON(this, json)
    return this
 }
}
