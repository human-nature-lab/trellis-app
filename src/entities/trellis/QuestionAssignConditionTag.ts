import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm'
import { Serializable } from '../decorators/WebOrmDecorators'
import SparseTimestampedSoftDelete from '../base/SparseTimestampedSoftDelete'

@Entity()
export default class QuestionAssignConditionTag extends SparseTimestampedSoftDelete {
  @PrimaryGeneratedColumn('uuid') @Serializable
  id: string

  @Column() @Serializable
  questionId: string

  @Column() @Serializable
  assignConditionTagId: string
}
