import {Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn} from 'typeorm'
import {Serializable} from '../TypeOrmDecorators'
import TimestampedSoftDelete from '../base/TimestampedSoftDelete'
import {mapFromSnakeJSON} from '../../services/JSONUtil'
import Photo from './Photo'
import Respondent from './Respondent'

@Entity()
export default class RespondentPhoto extends TimestampedSoftDelete {
  @PrimaryGeneratedColumn() @Serializable
  id: string
  @Column() @Serializable
  respondentId: string
  @Column() @Serializable
  photoId: string
  @Column({ type: 'tinyint' }) @Serializable
  sortOrder: number
  @Column({ type: 'text', nullable: true }) @Serializable
  notes: string

  photo: Photo

  fromSnakeJSON(json: object) {
    mapFromSnakeJSON(this, json, {
      photo: Photo
    })
    super.fromSnakeJSON(json)
    return this
 }
}
