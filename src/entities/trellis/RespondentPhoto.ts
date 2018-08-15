import {Entity, Column, PrimaryGeneratedColumn} from '../TypeOrmDecorators'
import TimestampedSoftDelete from '../base/TimestampedSoftDelete'
import {mapFromSnakeJSON, mapPropsFromJSON} from "../../services/JSONUtil";
import Photo from "./Photo";

@Entity()
export default class RespondentPhoto extends TimestampedSoftDelete {
  @PrimaryGeneratedColumn()
  id: string
  @Column()
  respondentId: string
  @Column()
  photoId: string
  @Column({ type: 'tinyint' })
  sortOrder: number
  @Column({ type: 'text', nullable: true })
  notes: string

  photo: Photo

  fromSnakeJSON(json: object) {
    mapPropsFromJSON(this, json, ['id', 'respondent_id', 'photo_id', 'sort_order', 'notes', 'created_at', 'updated_at', 'deleted_at'])
    mapFromSnakeJSON(this, json, {
      photo: Photo
    })
    super.fromSnakeJSON(json)
    return this
 }
}
