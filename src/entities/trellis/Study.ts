import {Entity, Column, PrimaryGeneratedColumn} from 'typeorm'
import TimestampedSoftDelete from '../base/TimestampedSoftDelete'
import {mapPropsFromJSON} from "../../services/JSONUtil";
import Locale from "./Locale";

@Entity()
export default class Study extends TimestampedSoftDelete {
  @PrimaryGeneratedColumn()
  id: string
  @Column()
  name: string
  @Column({ type: "tinyint" })
  photoQuality: number
  @Column()
  defaultLocaleId: string

  defaultLocale: Locale

  fromJSON(json: object) {
    mapPropsFromJSON(this, json)
    return this
 }
}
