import {Entity, Column, PrimaryGeneratedColumn} from '../TypeOrmDecorators'
import TimestampedSoftDelete from '../base/TimestampedSoftDelete'
import {mapFromSnakeJSON} from "../../services/JSONUtil";
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
    mapFromSnakeJSON(this, json, {
      photo: Photo
    })
    super.fromSnakeJSON(json)
    return this
 }
}
