import {Entity, Column, PrimaryGeneratedColumn} from 'typeorm'
import TimestampedSoftDelete from '../base/TimestampedSoftDelete'
import {mapPropsFromJSON, mapFromSnakeJSON} from "../../services/JSONUtil";
import GeoType from "./GeoType";
import Translation from "./Translation";

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
  nameTranslation: Translation

  fromSnakeJSON(json: object) {
    mapPropsFromJSON(this, json, ['id', 'geo_type_id', 'parent_id', 'latitude', 'longitude', 'altitude', 'name_translation_id', 'updated_at', 'created_at', 'deleted_at'])
    mapFromSnakeJSON(this, json, {
      geo_type: GeoType,
      name_translation: Translation
    })
    return this
 }
}
