import {Entity, Column, PrimaryGeneratedColumn} from 'typeorm'
import TimestampedSoftDelete from '../base/TimestampedSoftDelete'
import {assignJSONProps} from "../../services/JSONUtil";

@Entity()
export default class Translation extends TimestampedSoftDelete {
  @PrimaryGeneratedColumn()
  id: string

  fromJSON(json: object) {
    assignJSONProps(this, json)
  }
}
