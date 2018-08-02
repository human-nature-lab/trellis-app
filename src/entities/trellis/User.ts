import {Entity, Column, PrimaryGeneratedColumn} from 'typeorm'
import TimestampedSoftDelete from '../base/TimestampedSoftDelete'
import {mapPropsFromJSON} from "../../services/JSONUtil";

@Entity()
export default class User extends TimestampedSoftDelete {
  @PrimaryGeneratedColumn()
  id: string
  @Column()
  name: string
  @Column()
  username: string
  @Column()
  password: string
  @Column({ nullable: true })
  role: string
  @Column({ nullable: true })
  selectedStudyId: string

  fromJSON(json: object) {
    mapPropsFromJSON(this, json)
    return this
  }
}
