import {Entity, PrimaryGeneratedColumn, Column, ManyToMany} from 'typeorm'
import {Serializable} from '../TypeOrmDecorators'
import TimestampedSoftDelete from "../base/TimestampedSoftDelete";
import Respondent from './Respondent'
import Geo from './Geo'

@Entity("photo")
export default class Photo extends TimestampedSoftDelete {
  @PrimaryGeneratedColumn({ name: "id" }) @Serializable
  id: string;

  @Column({ name: "file_name" }) @Serializable
  fileName: string;

  @ManyToMany(type => Respondent, respondent => respondent.photos)
  respondents: Respondent[]

  @ManyToMany(type => Geo, geo => geo.photos)
  geos: Geo[]
}
