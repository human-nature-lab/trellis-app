import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm'
import { Serializable } from '../decorators/WebOrmDecorators'
import TimestampedSoftDelete from '../base/TimestampedSoftDelete'

@Entity()
export default class PhotoTag extends TimestampedSoftDelete {
  @PrimaryGeneratedColumn('uuid') @Serializable
  id: string

  @Column() @Serializable
  photoId: string

  @Column() @Serializable
  tagId: string
}
