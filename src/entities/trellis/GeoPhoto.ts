import { Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn } from 'typeorm'
import { Serializable } from '../decorators/WebOrmDecorators'
import TimestampedSoftDelete from '../base/TimestampedSoftDelete'
import Photo from './Photo'

@Entity()
export default class GeoPhoto extends TimestampedSoftDelete {
  @PrimaryGeneratedColumn('uuid') @Serializable
  id: string

  @Column() @Serializable
  geoId: string

  @Column() @Serializable
  photoId: string

  @Column({ type: 'tinyint' }) @Serializable
  sortOrder: number

  @Column({ type: 'text' }) @Serializable
  notes: string

  @OneToOne(type => Photo)
  @JoinColumn()
  photo: Photo
}
