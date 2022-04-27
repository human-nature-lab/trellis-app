import { Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn } from 'typeorm'
import { Serializable } from '../decorators/WebOrmDecorators'
import TimestampedSoftDelete from '../base/TimestampedSoftDelete'
import Photo from './Photo'

@Entity()
export default class RespondentPhoto extends TimestampedSoftDelete {
  @PrimaryGeneratedColumn('uuid') @Serializable
  id: string

  @Column('uuid') @Serializable
  respondentId: string

  @Column('uuid') @Serializable
  photoId: string

  @Column({ type: 'tinyint' }) @Serializable
  sortOrder: number

  @Column({ type: 'text', nullable: true }) @Serializable
  notes: string

  @OneToOne(type => Photo)
  @JoinColumn()
  photo: Photo
}
