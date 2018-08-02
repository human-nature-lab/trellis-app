import {Entity, Column, PrimaryGeneratedColumn} from 'typeorm'
import TimestampedSoftDelete from '../base/TimestampedSoftDelete'
import {assignJSONProps} from "../../services/JSONUtil";

@Entity()
export default class Geo extends TimestampedSoftDelete {
  @PrimaryGeneratedColumn()
  id: string
  @Column()
  geoTypeId: string
  @Column()
  parentId: string
  @Column({ type: 'double', nullable: true })
  latitude: number
  @Column({ type: 'double', nullable: true })
  longitude: number
  @Column({ type: 'double', nullable: true })
  altitude: number
  @Column()
  nameTranslationId: string

  fromJSON(json: object) {
    assignJSONProps(this, json)
  }
}
