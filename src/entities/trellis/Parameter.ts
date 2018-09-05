import {Entity, Column, PrimaryGeneratedColumn} from 'typeorm'
import {Serializable} from '../decorators/WebOrmDecorators'
import BareTimestampedSoftDelete from '../base/BareTimestampedSoftDelete'

@Entity()
export default class Parameter extends BareTimestampedSoftDelete {
  @PrimaryGeneratedColumn() @Serializable
  id: string
  @Column() @Serializable
  name: string
}
