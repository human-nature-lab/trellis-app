import {Entity, Column, PrimaryGeneratedColumn} from 'typeorm'
import {Relationship, Serializable} from '../decorators/WebOrmDecorators'
import TimestampedSoftDelete from '../base/TimestampedSoftDelete'
import Photo from './Photo'

@Entity()
export default class GeoPhoto extends TimestampedSoftDelete {
  @PrimaryGeneratedColumn() @Serializable
  id: string
  @Column() @Serializable
  geoId: string
  @Column() @Serializable
  photoId: string
  @Column({ type: 'tinyint' }) @Serializable
  sortOrder: number
  @Column({ type: 'text' }) @Serializable
  notes: string

  @Relationship(type => Photo)
  photo: Photo
}
