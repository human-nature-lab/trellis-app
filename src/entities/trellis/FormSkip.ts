import {Entity, Column, PrimaryGeneratedColumn} from 'typeorm'
import {Relationship, Serializable} from '../decorators/WebOrmDecorators'
import SparseTimestampedSoftDelete from '../base/SparseTimestampedSoftDelete'
import Skip from "./Skip";

@Entity()
export default class FormSkip extends SparseTimestampedSoftDelete {
  @PrimaryGeneratedColumn() @Serializable
  id: string
  @Column() @Serializable
  formId: string
  @Column() @Serializable
  skipId: string

  @Relationship(type => Skip)
  skip: Skip
}
