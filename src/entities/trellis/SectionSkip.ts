import {Entity, Column, PrimaryGeneratedColumn} from 'typeorm'
import {Serializable} from '../decorators/WebOrmDecorators'
import BareTimestampedSoftDelete from '../base/BareTimestampedSoftDelete'

@Entity()
export default class SectionSkip extends BareTimestampedSoftDelete {
  @PrimaryGeneratedColumn() @Serializable
  id: string
  @Column() @Serializable
  sectionId: string
  @Column() @Serializable
  skipId: string
}
