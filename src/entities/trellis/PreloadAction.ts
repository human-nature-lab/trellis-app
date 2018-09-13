import {Column, Entity, PrimaryGeneratedColumn} from 'typeorm'
import SnakeSerializable from '../interfaces/SnakeSerializable'
import {AsDate, Serializable} from '../decorators/WebOrmDecorators'
import BaseEntity from '../base/BaseEntity'

@Entity()
export default class PreloadAction extends BaseEntity implements SnakeSerializable {
  @PrimaryGeneratedColumn('uuid') @Serializable
  id: string
  @Column() @Serializable
  actionType: string
  @Column() @Serializable
  payload: string
  @Column() @Serializable
  respondentId: string
  @Column() @Serializable
  questionId: string
  @Column() @Serializable @AsDate
  createdAt: Date
  @Column() @Serializable @AsDate
  deletedAt: Date
}
