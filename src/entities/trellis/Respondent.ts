import {Entity, Column, PrimaryGeneratedColumn} from 'typeorm'
import TimestampedSoftDelete from '../base/TimestampedSoftDelete'
import {mapPropsFromJSON} from "../../services/JSONUtil";

@Entity()
export default class Respondent extends TimestampedSoftDelete {
  @PrimaryGeneratedColumn()
  id: string
  @Column({ nullable: true })
  assignedId: string
  @Column({ nullable: true })
  geoId: string
  @Column({ nullable: true })
  notes: string
  @Column({ nullable: true })
  geoNotes: string
  @Column()
  name: string
  @Column({ nullable: true })
  associatedRespondentId: string

  fromJSON(json: object) {
    mapPropsFromJSON(this, json)
    return this
 }
}
