import {Entity, Column, PrimaryGeneratedColumn} from 'typeorm'
import {Serializable} from '../TypeOrmDecorators'
import TimestampedSoftDelete from '../base/TimestampedSoftDelete'

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
}
