import {Entity, Column, PrimaryGeneratedColumn} from 'typeorm'
import TimestampedSoftDelete from '../base/TimestampedSoftDelete'
import {mapPropsFromJSON, mapFromJSON} from "../../services/JSONUtil";
import GeoType from "./GeoType";

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

  geoType: GeoType

  fromJSON(json: object) {
    mapPropsFromJSON(this, json)
    mapFromJSON(this, json, {
      geoType: GeoType
    })
    return this
 }
}
