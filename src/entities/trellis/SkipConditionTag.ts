import {Entity, Column, PrimaryGeneratedColumn} from 'typeorm'
import {Serializable} from '../decorators/WebOrmDecorators'
import SparseTimestampedSoftDelete from '../base/SparseTimestampedSoftDelete'

@Entity()
export default class SkipConditionTag extends SparseTimestampedSoftDelete {
  @PrimaryGeneratedColumn() @Serializable
  id: string
  @Column() @Serializable
  skipId: string
  @Column() @Serializable
  conditionTagName: string
}
