import {Entity, Column, PrimaryGeneratedColumn} from '../TypeOrmDecorators'
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
