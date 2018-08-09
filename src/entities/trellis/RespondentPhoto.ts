import {Entity, Column, PrimaryGeneratedColumn} from 'typeorm'
import TimestampedSoftDelete from '../base/TimestampedSoftDelete'
import {mapPropsFromJSON} from "../../services/JSONUtil";

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

  fromJSON(json: object) {
    mapPropsFromJSON(this, json)
    return this
 }
}
