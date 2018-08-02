import {Entity, Column, PrimaryGeneratedColumn} from 'typeorm'
import TimestampedSoftDelete from '../base/TimestampedSoftDelete'
import {assignJSONProps} from "../../services/JSONUtil";

@Entity()
export default class Skip extends TimestampedSoftDelete {
  @PrimaryGeneratedColumn()
  id: string
  @Column()
  showHide: boolean
  @Column()
  anyAll: boolean
  @Column({ type: 'tinyint' })
  precedence: number

  fromJSON(json: object) {
    assignJSONProps(this, json)
  }
}
