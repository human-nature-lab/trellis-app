import { Entity, Column, PrimaryColumn, ManyToMany } from 'typeorm'
import { Serializable } from '../decorators/WebOrmDecorators'
import SparseTimestampedSoftDelete from '../base/SparseTimestampedSoftDelete'
import Skip from './Skip'

@Entity()
export default class ConditionTag extends SparseTimestampedSoftDelete {
  @PrimaryColumn('uuid') @Serializable
  id: string

  @Column('text') @Serializable
  name: string

  @ManyToMany(type => Skip, skip => skip.conditionTags)
  skips: Skip[]
}
