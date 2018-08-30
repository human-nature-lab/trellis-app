import {Entity, Column, PrimaryGeneratedColumn, OneToMany} from 'typeorm'
import {Serializable} from '../decorators/WebOrmDecorators'
import TimestampedSoftDelete from '../base/TimestampedSoftDelete'
import Interview from './Interview'

@Entity()
export default class User extends TimestampedSoftDelete {
  @PrimaryGeneratedColumn() @Serializable
  id: string
  @Column() @Serializable
  name: string
  @Column() @Serializable
  username: string
  @Column() @Serializable
  password: string
  @Column({ nullable: true }) @Serializable
  role: string
  @Column({ nullable: true }) @Serializable
  selectedStudyId: string
}
