import {Entity, Column, PrimaryGeneratedColumn} from 'typeorm'
import {Serializable} from '../WebOrmDecorators'
import TimestampedSoftDelete from '../base/TimestampedSoftDelete'

@Entity()
export default class UserStudy extends TimestampedSoftDelete {
  @PrimaryGeneratedColumn() @Serializable
  id: string
  @Column() @Serializable
  userId: string
  @Column() @Serializable
  studyId: string
}
