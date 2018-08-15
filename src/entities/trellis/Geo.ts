import {Entity, Column, PrimaryGeneratedColumn} from '../TypeOrmDecorators'
import TimestampedSoftDelete from '../base/TimestampedSoftDelete'
import {mapFromSnakeJSON} from "../../services/JSONUtil";
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
    mapFromSnakeJSON(this, json, {
      geoType: GeoType,
      nameTranslation: Translation
    })
    super.fromSnakeJSON(json)
    return this
 }
}
