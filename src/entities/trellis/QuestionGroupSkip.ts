import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm'
import { Relationship, Serializable } from '../decorators/WebOrmDecorators'
import SparseTimestampedSoftDelete from '../base/SparseTimestampedSoftDelete'
import Skip from './Skip'

@Entity()
export default class QuestionGroupSkip extends SparseTimestampedSoftDelete {
  @PrimaryGeneratedColumn('uuid') @Serializable
  id: string

  @Column('uuid') @Serializable
  questionGroupId: string

  @Column('uuid') @Serializable
  skipId: string

  @Relationship(type => Skip)
  skip: Skip
}
