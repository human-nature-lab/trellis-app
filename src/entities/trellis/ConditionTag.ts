import {Entity, Column, PrimaryGeneratedColumn, ManyToMany} from 'typeorm'
import {Serializable} from '../decorators/WebOrmDecorators'
import SparseTimestampedSoftDelete from '../base/SparseTimestampedSoftDelete'
import Skip from "./Skip";

@Entity()
export default class ConditionTag extends SparseTimestampedSoftDelete {
  @PrimaryGeneratedColumn() @Serializable
  id: string
  @Column() @Serializable
  name: string

  @ManyToMany(type => Skip, skip => skip.conditionTags)
  skips: Skip[]
}
