import {Entity, Column, PrimaryGeneratedColumn} from 'typeorm'
import TimestampedSoftDelete from '../base/TimestampedSoftDelete'
import {assignJSONProps} from "../../services/JSONUtil";

@Entity()
export default class Study extends TimestampedSoftDelete {
  @PrimaryGeneratedColumn()
  id: string
  @Column()
  name: string
  @Column({ type: "tinyint" })
  photoQuality: number
  @Column()
  defaultLocaleId: string

  fromJSON(json: object) {
    assignJSONProps(this, json)
  }
}
