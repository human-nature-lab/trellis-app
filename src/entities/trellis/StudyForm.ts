import {Entity, Column, PrimaryGeneratedColumn} from 'typeorm'
import TimestampedSoftDelete from '../base/TimestampedSoftDelete'
import {mapPropsFromJSON} from "../../services/JSONUtil";

@Entity()
export default class StudyForm extends TimestampedSoftDelete {
  @PrimaryGeneratedColumn()
  id: string
  @Column()
  studyId: string
  @Column()
  formMasterId: string
  @Column()
  sortOrder: string
  @Column()
  formTypeId: string
  @Column({ nullable: true })
  censusTypeId: string

  fromJSON(json: object) {
    mapPropsFromJSON(this, json)
    return this
 }
}
