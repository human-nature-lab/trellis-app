import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm'
import { Serializable } from '../decorators/WebOrmDecorators'
import TimestampedSoftDelete from '../base/TimestampedSoftDelete'

@Entity()
export default class RespondentFill extends TimestampedSoftDelete {
  @PrimaryGeneratedColumn('uuid') @Serializable
  id: string

  @Column() @Serializable
  respondentId: string

  @Column() @Serializable
  name: string

  @Column('text') @Serializable
  val: string
}
