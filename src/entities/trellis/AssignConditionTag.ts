import {Entity, Column, PrimaryGeneratedColumn} from 'typeorm'
import {Serializable} from '../TypeOrmDecorators'
import TimestampedSoftDelete from '../base/TimestampedSoftDelete'
import ConditionTag from "./ConditionTag";
import {mapFromSnakeJSON} from "../../services/JSONUtil";

@Entity()
export default class AssignConditionTag extends TimestampedSoftDelete {
  @PrimaryGeneratedColumn() @Serializable
  id: string
  @Column() @Serializable
  conditionTagId: string
  @Column({ type: 'text' }) @Serializable
  logic: string
  @Column({nullable: true}) @Serializable
  scope: string

  conditionTag: ConditionTag

  fromSnakeJSON (json: any) {
    mapFromSnakeJSON(this, json, {
      conditionTag: {
        constructor: ConditionTag,
        jsonKey: 'condition'
      }
    })
    return super.fromSnakeJSON(json)
  }
}
