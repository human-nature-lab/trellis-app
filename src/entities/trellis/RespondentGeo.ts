import {Entity, Column, PrimaryGeneratedColumn} from 'typeorm'
import TimestampedSoftDelete from '../base/TimestampedSoftDelete'
import {mapFromJSON, mapPropsFromJSON} from "../../services/JSONUtil";
import Geo from "./Geo";

@Entity()
export default class RespondentGeo extends TimestampedSoftDelete {
  @PrimaryGeneratedColumn()
  id: string
  @Column()
  geoId: string
  @Column()
  respondentId: string
  @Column({ nullable: true })
  previousRespondentGeoId: string
  @Column({ nullable: true })
  notes: string
  @Column()
  isCurrent: boolean

  geo: Geo

  fromJSON(json: object) {
    mapPropsFromJSON(this, json, ['id', 'geo_id', 'respondent_id', 'previous_respondent_geo_id', 'notes', 'is_current', 'updated_at', 'created_at', 'deleted_at'])
    mapFromJSON(this, json,{
      geo: Geo
    })
    return this
 }
}
