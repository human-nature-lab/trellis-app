import {Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn} from 'typeorm'
import {Relationship, Serializable} from '../decorators/WebOrmDecorators'
import TimestampedSoftDelete from '../base/TimestampedSoftDelete'
import Photo from './Photo'

@Entity()
export default class RespondentPhoto extends TimestampedSoftDelete {
  @PrimaryGeneratedColumn('uuid') @Serializable
  id: string
  @Column() @Serializable
  respondentId: string
  @Column() @Serializable
  photoId: string
  @Column({ type: 'tinyint' }) @Serializable
  sortOrder: number
  @Column({ type: 'text', nullable: true }) @Serializable
  notes: string

  @Relationship(type => Photo)
  photo: Photo

}
