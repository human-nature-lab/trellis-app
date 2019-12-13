import { Relationship, Serializable } from '../decorators/WebOrmDecorators'
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToOne, JoinColumn } from 'typeorm'
import TimestampedSoftDelete from '../base/TimestampedSoftDelete'
import Geo from './Geo'
import Respondent from './Respondent'

@Entity()
export default class RespondentGeo extends TimestampedSoftDelete {
  @PrimaryGeneratedColumn('uuid') @Serializable
  id: string
  @Column() @Serializable
  geoId: string
  @Column() @Serializable
  respondentId: string
  @Column({ nullable: true }) @Serializable
  previousRespondentGeoId: string
  @Column({ nullable: true }) @Serializable
  notes: string
  @Column({ type: Boolean }) @Serializable
  isCurrent: boolean

  @ManyToOne(type => Respondent, respondent => respondent.geos)
  respondent: Respondent

  @Relationship(type =>Geo)
  @OneToOne(type => Geo)
  @JoinColumn()
  geo: Geo

  history?: RespondentGeo[]

  fromSnakeJSON(json: any) {
    // I hate that this is necessary, but the json comes in two different forms
    if (json.pivot) {
      super.fromSnakeJSON(json.pivot)
      this.geo = new Geo().fromSnakeJSON(json)
      if (!this.geoId) {
        this.geoId = this.geo.id
      }
    } else {
      super.fromSnakeJSON(json)
    }
    this.isCurrent = !!this.isCurrent
    return this
 }
}
