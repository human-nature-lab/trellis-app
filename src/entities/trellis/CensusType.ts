import {Entity, Column, PrimaryGeneratedColumn} from 'typeorm'
import TimestampedSoftDelete from '../base/TimestampedSoftDelete'
import {mapPropsFromJSON} from "../../services/JSONUtil";

@Entity()
export default class CensusType {
  @PrimaryGeneratedColumn()
  id: string
  @Column()
  name: string

  fromJSON(json: object) {
    mapPropsFromJSON(this, json)
    return this
 }
}
