import {Entity, Column, PrimaryGeneratedColumn} from 'typeorm'
import {Serializable} from '../WebOrmDecorators'
import TimestampedSoftDelete from '../base/TimestampedSoftDelete'

@Entity()
export default class FormSkip extends TimestampedSoftDelete {
  @PrimaryGeneratedColumn() @Serializable
  id: string
  @Column() @Serializable
  formId: string
  @Column() @Serializable
  skipId: string
}
