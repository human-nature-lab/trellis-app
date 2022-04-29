import { Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn } from 'typeorm'
import { Serializable } from '../decorators/WebOrmDecorators'
import TimestampedSoftDelete from '../base/TimestampedSoftDelete'
import Photo from './Photo'

@Entity()
export default class DatumPhoto extends TimestampedSoftDelete {
  @PrimaryGeneratedColumn('uuid') @Serializable
  id: string

  @Column() @Serializable
  datumId: string

  @Column() @Serializable
  photoId: string

  @Column({ type: 'tinyint' }) @Serializable
  sortOrder: number

  @Column({ type: 'text', nullable: true }) @Serializable
  notes: string

  @OneToOne(type => Photo)
  @JoinColumn()
  photo: Photo
}
