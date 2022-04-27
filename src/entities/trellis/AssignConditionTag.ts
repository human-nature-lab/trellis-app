import { Entity, Column, PrimaryGeneratedColumn, ManyToMany, OneToOne, JoinColumn } from 'typeorm'
import { Relationship, Serializable } from '../decorators/WebOrmDecorators'
import SparseTimestampedSoftDelete from '../base/SparseTimestampedSoftDelete'
import ConditionTag from './ConditionTag'
import Question from './Question'

@Entity()
export default class AssignConditionTag extends SparseTimestampedSoftDelete {
  @PrimaryGeneratedColumn('uuid') @Serializable
  id: string

  @Column('uuid') @Serializable
  conditionTagId: string

  @Column({ type: 'text' }) @Serializable
  logic: string

  @Column({ nullable: true, type: 'text' }) @Serializable
  scope: string

  @Relationship({
    constructor: () => ConditionTag,
    jsonKey: 'condition',
  })
  @OneToOne(type => ConditionTag, { eager: true })
  @JoinColumn()
  conditionTag: ConditionTag

  @ManyToMany(type => Question, q => q.assignConditionTags)
  questions: Question[]
}
