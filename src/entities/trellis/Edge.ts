import {Entity, Column, PrimaryGeneratedColumn} from 'typeorm'
import TimestampedSoftDelete from '../base/TimestampedSoftDelete'
import {mapPropsFromJSON} from "../../services/JSONUtil";

@Entity()
export default class Edge extends TimestampedSoftDelete {
  @PrimaryGeneratedColumn()
  id: string
  @Column()
  sourceRespondentId: string
  @Column()
  targetRespondentId: string

  fromJSON(json: object) {
    mapPropsFromJSON(this, json)
    return this
 }
}
