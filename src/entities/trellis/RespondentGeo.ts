import {Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToOne, JoinColumn} from 'typeorm'
import {Serializable} from '../TypeOrmDecorators'
import TimestampedSoftDelete from '../base/TimestampedSoftDelete'
import {mapFromSnakeJSON, mapPropsFromJSON} from "../../services/JSONUtil";
import Geo from "./Geo";
import Respondent from './Respondent'

@Entity()
export default class RespondentGeo extends TimestampedSoftDelete {
  @PrimaryGeneratedColumn() @Serializable
  id: string
  @Column() @Serializable
  geoId: string
  @Column() @Serializable
  respondentId: string
  @Column({ nullable: true }) @Serializable
  previousRespondentGeoId: string
  @Column({ nullable: true }) @Serializable
  notes: string
  @Column() @Serializable
  isCurrent: boolean

  @ManyToOne(type => Respondent, respondent => respondent.geos)
  respondent: Respondent

  @OneToOne(type => Geo, { eager: true })
  @JoinColumn({ name: 'geo_id' })
  geo: Geo

  fromSnakeJSON(json: any) {
    const snakeCols = ['id', 'geo_id', 'respondent_id', 'previous_respondent_geo_id', 'notes', 'is_current', 'updated_at', 'created_at', 'deleted_at']
    // I hate that this is necessary, but the json comes in two different forms
    if (json.pivot) {
      mapPropsFromJSON(this, json.pivot, snakeCols)
      this.geo = new Geo().fromSnakeJSON(json)
      if (!this.geoId) {
        this.geoId = this.geo.id
      }
    } else {
      mapPropsFromJSON(this, json, snakeCols)
      mapFromSnakeJSON(this, json, {
        geo: Geo
      })
    }
    super.parseDates()
    return this
 }
}
