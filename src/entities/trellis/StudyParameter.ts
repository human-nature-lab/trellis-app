import {Entity, Column, PrimaryGeneratedColumn} from 'typeorm'
import TimestampedSoftDelete from '../base/TimestampedSoftDelete'
import {mapPropsFromJSON} from "../../services/JSONUtil";

@Entity()
export default class StudyParameter extends TimestampedSoftDelete {
  @PrimaryGeneratedColumn()
  id: string
  @Column()
  studyId: string
  @Column()
  parameterId: string
  @Column()
  val: string

  fromJSON(json: object) {
    mapPropsFromJSON(this, json)
    return this
 }
}
