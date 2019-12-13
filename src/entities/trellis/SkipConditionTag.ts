import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm'
import { Serializable } from '../decorators/WebOrmDecorators'
import SparseTimestampedSoftDelete from '../base/SparseTimestampedSoftDelete'
import Skip from './Skip'

@Entity()
export default class SkipConditionTag extends SparseTimestampedSoftDelete {
  @PrimaryGeneratedColumn() @Serializable
  id: string
  @Column() @Serializable
  skipId: string
  @Column() @Serializable
  conditionTagName: string

  @ManyToOne(type => Skip, skip => skip.conditionTags)
  @JoinColumn()
  skip: Skip
}
