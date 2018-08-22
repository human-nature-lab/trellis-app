import {Entity, Column, PrimaryGeneratedColumn} from 'typeorm'
import {Relationship, Serializable} from '../WebOrmDecorators'
import TimestampedSoftDelete from '../base/TimestampedSoftDelete'
import {mapFromSnakeJSON, mapPropsFromJSON} from "../../services/JSONUtil";
import Geo from "./Geo";

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

  @Relationship(Geo)
  geo: Geo

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
    return this
 }
}
