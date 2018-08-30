import {Entity, Column, PrimaryGeneratedColumn} from 'typeorm'
import {Relationship, Serializable} from '../decorators/WebOrmDecorators'
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

  @Relationship({
    constructor: ConditionTag,
    jsonKey: 'condition'
  })
  conditionTag: ConditionTag
}
