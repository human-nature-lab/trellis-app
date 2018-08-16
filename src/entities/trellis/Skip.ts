import {Entity, Column, PrimaryGeneratedColumn} from 'typeorm'
import {Serializable} from '../TypeOrmDecorators'
import TimestampedSoftDelete from '../base/TimestampedSoftDelete'
import ConditionTag from "./ConditionTag";
import {mapFromSnakeJSON} from "../../services/JSONUtil";

@Entity()
export default class Skip extends TimestampedSoftDelete {
  @PrimaryGeneratedColumn() @Serializable
  id: string
  @Column() @Serializable
  showHide: boolean
  @Column() @Serializable
  anyAll: boolean
  @Column({ type: 'tinyint' }) @Serializable
  precedence: number

  conditionTags: ConditionTag[]

  fromSnakeJSON (json: any) {
    debugger
    mapFromSnakeJSON(this, json, {
      conditionTags: ConditionTag
    })
    return super.fromSnakeJSON(json)
  }
}
