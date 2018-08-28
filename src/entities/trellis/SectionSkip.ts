import {Entity, Column, PrimaryGeneratedColumn} from 'typeorm'
import {Serializable} from '../WebOrmDecorators'
import TimestampedSoftDelete from '../base/TimestampedSoftDelete'

@Entity()
export default class SectionSkip extends TimestampedSoftDelete {
  @PrimaryGeneratedColumn() @Serializable
  id: string
  @Column() @Serializable
  sectionId: string
  @Column() @Serializable
  skipId: string
}
