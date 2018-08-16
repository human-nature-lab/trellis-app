import {Entity, Column, PrimaryGeneratedColumn} from 'typeorm'
import {Serializable} from '../TypeOrmDecorators'
import TimestampedSoftDelete from '../base/TimestampedSoftDelete'

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
