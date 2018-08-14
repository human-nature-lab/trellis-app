import {Entity, Column, PrimaryGeneratedColumn} from 'typeorm'
import TimestampedSoftDelete from '../base/TimestampedSoftDelete'
import {mapPropsFromJSON} from "../../services/JSONUtil";

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

  fromSnakeJSON(json: object) {
    mapPropsFromJSON(this, json)
    return this
 }
}
