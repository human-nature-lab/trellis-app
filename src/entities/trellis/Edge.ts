import {Entity, Column, PrimaryGeneratedColumn} from 'typeorm'
import TimestampedSoftDelete from '../base/TimestampedSoftDelete'
import {assignJSONProps} from "../../services/JSONUtil";

@Entity()
export default class Edge extends TimestampedSoftDelete {
  @PrimaryGeneratedColumn()
  id: string
  @Column()
  sourceRespondentId: string
  @Column()
  targetRespondentId: string

  fromJSON(json: object) {
    assignJSONProps(this, json)
  }
}
