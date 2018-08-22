import {Entity, Column, PrimaryGeneratedColumn} from 'typeorm'
import {Serializable} from '../WebOrmDecorators'
import TimestampedSoftDelete from '../base/TimestampedSoftDelete'

@Entity()
export default class RespondentName extends TimestampedSoftDelete {
  @PrimaryGeneratedColumn() @Serializable
  id: string
  @Column() @Serializable
  isDisplayName: boolean
  @Column() @Serializable
  name: string
  @Column() @Serializable
  respondentId: string
  @Column({ nullable: true }) @Serializable
  localeId: string
  @Column({ nullable: true }) @Serializable
  previousRespondentNameId: string
}
