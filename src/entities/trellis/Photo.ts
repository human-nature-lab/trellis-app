import { Entity, Column, ManyToMany, PrimaryColumn } from 'typeorm'
import { Serializable } from '../decorators/WebOrmDecorators'
import TimestampedSoftDelete from '../base/TimestampedSoftDelete'
import Respondent from './Respondent'
import Geo from './Geo'

@Entity('photo')
export default class Photo extends TimestampedSoftDelete {
  @PrimaryColumn('uuid') @Serializable
  id: string;

  @Column('text') @Serializable
  fileName: string;

  @ManyToMany(type => Respondent, respondent => respondent.photos)
  respondents: Respondent[]

  @ManyToMany(type => Geo, geo => geo.photos)
  geos: Geo[]
}
