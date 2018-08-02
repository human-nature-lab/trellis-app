import {Entity, Column, PrimaryGeneratedColumn} from 'typeorm'
import TimestampedSoftDelete from '../base/TimestampedSoftDelete'
import {assignJSONProps} from "../../services/JSONUtil";

@Entity()
export default class Section extends TimestampedSoftDelete {
  @PrimaryGeneratedColumn()
  id: string
  @Column()
  nameTranslationId: string

  fromJSON(json: object) {
    assignJSONProps(this, json)
  }
}
