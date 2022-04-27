import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToOne } from 'typeorm'
import { Serializable } from '../decorators/WebOrmDecorators'
import TimestampedSoftDelete from '../base/TimestampedSoftDelete'
import User from './User'
import Study from './Study'

@Entity()
export default class UserStudy extends TimestampedSoftDelete {
  @PrimaryGeneratedColumn('uuid') @Serializable
  id: string

  @Column('uuid') @Serializable
  userId: string

  @Column('uuid') @Serializable
  studyId: string

  @ManyToOne(type => User, user => user.studies)
  user: User

  @OneToOne(type => Study)
  study: Study
}
