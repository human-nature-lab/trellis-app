import {Entity, Column, PrimaryGeneratedColumn} from 'typeorm'
import TimestampedSoftDelete from '../base/TimestampedSoftDelete'
import {assignJSONProps} from "../../services/JSONUtil";

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

  fromJSON(json: object) {
    assignJSONProps(this, json)
  }
}
