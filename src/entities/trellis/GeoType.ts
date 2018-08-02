import {Entity, Column, PrimaryGeneratedColumn} from 'typeorm'
import TimestampedSoftDelete from '../base/TimestampedSoftDelete'
import {assignJSONProps} from "../../services/JSONUtil";

@Entity()
export default class GeoType extends TimestampedSoftDelete {
  @PrimaryGeneratedColumn()
  id: string
  @Column({ nullable: true })
  parentId: string
  @Column()
  studyId: string
  @Column()
  name: string
  @Column()
  canUserAdd: boolean
  @Column()
  canUserAddChild: boolean
  @Column()
  canContainRespondent: boolean

  fromJSON(json: object) {
    assignJSONProps(this, json)
  }
}
