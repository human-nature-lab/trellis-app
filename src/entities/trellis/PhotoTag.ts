import {Entity, Column, PrimaryGeneratedColumn} from 'typeorm'
import TimestampedSoftDelete from '../base/TimestampedSoftDelete'
import {mapPropsFromJSON} from "../../services/JSONUtil";

@Entity()
export default class PhotoTag extends TimestampedSoftDelete {
  @PrimaryGeneratedColumn()
  id: string
  @Column()
  photoId: string
  @Column()
  tagId: string

  fromSnakeJSON(json: object) {
    mapPropsFromJSON(this, json)
    super.fromSnakeJSON(json)
    return this
 }
}
