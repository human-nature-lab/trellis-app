import {Entity, Column, PrimaryGeneratedColumn} from '../TypeOrmDecorators'
import TimestampedSoftDelete from '../base/TimestampedSoftDelete'
import {mapPropsFromJSON} from "../../services/JSONUtil";
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

  fromSnakeJSON(json: any) {
    mapPropsFromJSON(this, json.pivot, ['id', 'geo_id', 'photo_id', 'sort_order', 'notes', 'updated_at', 'created_at', 'deleted_at'])
    this.photo = new Photo().fromSnakeJSON(json)
    super.fromSnakeJSON(json)
    return this
  }
}
