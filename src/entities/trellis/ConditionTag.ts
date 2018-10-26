import {Entity, Column, PrimaryColumn, ManyToMany} from 'typeorm'
import {Serializable} from '../decorators/WebOrmDecorators'
import SparseTimestampedSoftDelete from '../base/SparseTimestampedSoftDelete'
import Skip from "./Skip";

@Entity()
export default class ConditionTag extends SparseTimestampedSoftDelete {
  @PrimaryColumn() @Serializable
  id: string
  @Column() @Serializable
  name: string

  @ManyToMany(type => Skip, skip => skip.conditionTags)
  skips: Skip[]
}
