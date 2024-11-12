import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'
import TimestampedSoftDelete from '../base/TimestampedSoftDelete'
import { Serializable } from '../decorators/WebOrmDecorators'
import SnakeSerializable from '../interfaces/SnakeSerializable'

@Entity()
export default class Asset extends TimestampedSoftDelete implements SnakeSerializable {
  @PrimaryGeneratedColumn('uuid') @Serializable
  id: string

  @Column() @Serializable
  fileName: string

  @Column() @Serializable
  type: string

  @Column() @Serializable
  size: number

  @Column() @Serializable
  mimeType: string

  @Column() @Serializable
  isFromSurvey: boolean

  @Column() @Serializable
  md5Hash: string
}
