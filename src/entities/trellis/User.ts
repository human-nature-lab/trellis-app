import {Entity, Column, PrimaryGeneratedColumn} from 'typeorm'
import TimestampedSoftDelete from '../base/TimestampedSoftDelete'
import {mapCamelToPlain, mapPropsFromJSON} from "../../services/JSONUtil";
import SnakeSerializable from "../interfaces/SnakeSerializable";

@Entity()
export default class User extends TimestampedSoftDelete implements SnakeSerializable {
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

  fromJSON (json: object) {
    for (let key of ['id', 'name', 'username', 'password', 'role', 'selectedStudyId']) {
      this[key] = json[key]
    }
  }

  fromSnakeJSON (json: object) {
    mapPropsFromJSON(this, json)
    super.fromSnakeJSON(json)
    return this
  }

  toSnakeJSON () {
    return mapCamelToPlain(this, true)
  }
}
