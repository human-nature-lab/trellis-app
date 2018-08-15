import {Entity, Column, PrimaryGeneratedColumn} from '../TypeOrmDecorators'
import TimestampedSoftDelete from '../base/TimestampedSoftDelete'
import {camelToSnake, mapPropsFromJSON} from "../../services/JSONUtil";

@Entity()
export default class ConditionTag extends TimestampedSoftDelete {
  @PrimaryGeneratedColumn()
  id: string
  @Column()
  name: string

  fromJSON (json: object) {
    for (let key of this.__colNames__.map(camelToSnake)) {
      this[key] = json[key]
    }
    return this
  }

  fromSnakeJSON (json: object) {
    mapPropsFromJSON(this, json, this.__colNames__.map(camelToSnake))
    super.fromSnakeJSON(json)
    return this
 }

 copy () {
    return new ConditionTag().fromJSON(JSON.parse(JSON.stringify(this)))
 }
}
