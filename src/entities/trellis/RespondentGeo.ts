import {Entity, Column, PrimaryGeneratedColumn} from 'typeorm'
import TimestampedSoftDelete from '../base/TimestampedSoftDelete'
import {mapFromSnakeJSON, mapPropsFromJSON} from "../../services/JSONUtil";
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

  fromSnakeJSON(json: object) {
    mapPropsFromJSON(this, json, ['id', 'geo_id', 'respondent_id', 'previous_respondent_geo_id', 'notes', 'is_current', 'updated_at', 'created_at', 'deleted_at'])
    mapFromSnakeJSON(this, json,{
      geo: Geo
    })
    return this
 }
}
