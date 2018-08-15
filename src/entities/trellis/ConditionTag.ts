import {Entity, Column, PrimaryGeneratedColumn} from 'typeorm'
import TimestampedSoftDelete from '../base/TimestampedSoftDelete'
import {mapPropsFromJSON} from "../../services/JSONUtil";

@Entity()
export default class ConditionTag extends TimestampedSoftDelete {
  @PrimaryGeneratedColumn()
  id: string
  @Column()
  name: string

  fromJSON (json: object) {
    for (let key of ['id', 'name', 'updatedAt', 'createdAt', 'deletedAt']) {
      this[key] = json[key]
    }
    return this
  }

  fromSnakeJSON (json: object) {
    mapPropsFromJSON(this, json, ['id', 'name', 'created_at', 'updated_at', 'deleted_at'])
    super.fromSnakeJSON(json)
    return this
 }

 copy () {
    return new ConditionTag().fromJSON(JSON.parse(JSON.stringify(this)))
 }
}
