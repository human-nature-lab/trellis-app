import {Entity, Column, PrimaryGeneratedColumn} from 'typeorm'
import TimestampedSoftDelete from '../base/TimestampedSoftDelete'
import {mapFromJSON, mapPropsFromJSON} from "../../services/JSONUtil";
import Photo from "./Photo";

@Entity()
export default class GeoPhoto extends TimestampedSoftDelete {
  @PrimaryGeneratedColumn()
  id: string
  @Column()
  geoId: string
  @Column()
  photoId: string
  @Column({ type: 'tinyint' })
  sortOrder: number
  @Column({ type: 'text' })
  notes: string

  photo: Photo

  fromJSON(json: any) {
    mapPropsFromJSON(this, json.pivot, ['id', 'geo_id', 'photo_id', 'sort_order', 'notes', 'updated_at', 'created_at', 'deleted_at'])
    this.photo = new Photo().fromJSON(json)
    return this
  }
}
