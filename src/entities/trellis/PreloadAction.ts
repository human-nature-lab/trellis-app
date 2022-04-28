import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'
import SnakeSerializable from '../interfaces/SnakeSerializable'
import { AsDate, Serializable } from '../decorators/WebOrmDecorators'
import BaseEntity from '../base/BaseEntity'

@Entity()
export default class PreloadAction extends BaseEntity implements SnakeSerializable {
  @PrimaryGeneratedColumn('uuid') @Serializable
  id: string

  @Column('text') @Serializable
  actionType: string

  @Column('text') @Serializable
  payload: string

  @Column('uuid') @Serializable
  respondentId: string

  @Column('uuid') @Serializable
  questionId: string

  @Column({ type: 'datetime' }) @Serializable @AsDate
  createdAt: Date

  @Column({ type: 'datetime' }) @Serializable @AsDate
  deletedAt: Date
}
