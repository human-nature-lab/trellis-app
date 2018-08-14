import {Entity, Column, PrimaryGeneratedColumn, OneToOne, ManyToMany, JoinTable, JoinColumn} from 'typeorm'
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

  @ManyToMany(type => Locale)
  @JoinTable()
  locales: Promise<Locale[]>

  @OneToOne(type => Locale)
  @JoinColumn()
  defaultLocale: Locale

  fromSnakeJSON(json: object) {
    mapPropsFromJSON(this, json)
    return this
 }
}
