import {Entity, Column, PrimaryGeneratedColumn} from 'typeorm'
import {Serializable} from '../TypeOrmDecorators'
import TimestampedSoftDelete from '../base/TimestampedSoftDelete'
import {mapFromSnakeJSON} from "../../services/JSONUtil";
import GeoType from "./GeoType";
import Translation from "./Translation";

@Entity()
export default class Geo extends TimestampedSoftDelete {
  @PrimaryGeneratedColumn() @Serializable
  id: string
  @Column() @Serializable
  geoTypeId: string
  @Column() @Serializable
  parentId: string
  @Column({ type: 'double', nullable: true }) @Serializable
  latitude: number
  @Column({ type: 'double', nullable: true }) @Serializable
  longitude: number
  @Column({ type: 'double', nullable: true }) @Serializable
  altitude: number
  @Column() @Serializable
  nameTranslationId: string

  geoType: GeoType
  nameTranslation: Translation

  fromSnakeJSON(json: object) {
    mapFromSnakeJSON(this, json, {
      geoType: GeoType,
      nameTranslation: Translation
    })
    super.fromSnakeJSON(json)
    return this
 }
}
