import {Entity, Column, PrimaryGeneratedColumn} from 'typeorm'
import TimestampedSoftDelete from '../base/TimestampedSoftDelete'
import {assignJSONProps} from "../../services/JSONUtil";

@Entity()
export default class SectionSkip extends TimestampedSoftDelete {
  @PrimaryGeneratedColumn()
  id: string
  @Column()
  sectionId: string
  @Column()
  skipId: string

  fromJSON(json: object) {
    assignJSONProps(this, json)
  }
}
