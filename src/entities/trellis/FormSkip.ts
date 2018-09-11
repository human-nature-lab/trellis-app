import {Entity, Column, PrimaryGeneratedColumn} from 'typeorm'
import {Serializable} from '../decorators/WebOrmDecorators'
import SparseTimestampedSoftDelete from '../base/SparseTimestampedSoftDelete'

@Entity()
export default class FormSkip extends SparseTimestampedSoftDelete {
  @PrimaryGeneratedColumn() @Serializable
  id: string
  @Column() @Serializable
  formId: string
  @Column() @Serializable
  skipId: string
}
