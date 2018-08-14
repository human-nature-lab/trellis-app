import {Entity, Column, PrimaryGeneratedColumn} from 'typeorm'
import TimestampedSoftDelete from '../base/TimestampedSoftDelete'
import {mapPropsFromJSON} from "../../services/JSONUtil";

@Entity()
export default class SectionSkip extends TimestampedSoftDelete {
  @PrimaryGeneratedColumn()
  id: string
  @Column()
  sectionId: string
  @Column()
  skipId: string

  fromSnakeJSON(json: object) {
    mapPropsFromJSON(this, json)
    return this
 }
}
