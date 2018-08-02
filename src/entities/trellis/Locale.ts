import {Entity, Column, PrimaryGeneratedColumn} from 'typeorm'
import TimestampedSoftDelete from '../base/TimestampedSoftDelete'
import {assignJSONProps} from "../../services/JSONUtil";

@Entity()
export default class Locale extends TimestampedSoftDelete {
  @PrimaryGeneratedColumn()
  id: string
  @Column({ nullable: true })
  languageTag: string
  @Column({ nullable: true })
  languageName: string
  @Column({ nullable: true })
  languageNative: string

  fromJSON(json: object) {
    assignJSONProps(this, json)
  }
}
