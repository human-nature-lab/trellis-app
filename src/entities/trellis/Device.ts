import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm'
import { Relationship, Serializable } from '../decorators/WebOrmDecorators'
import TimestampedSoftDelete from '../base/TimestampedSoftDelete'
import User from './User'

@Entity()
export default class Device extends TimestampedSoftDelete {
  @PrimaryGeneratedColumn('uuid') @Serializable
  id: string

  @Column('uuid') @Serializable
  deviceId: string

  @Column('text') @Serializable
  name: string

  @Column('text') @Serializable
  key!: string

  @Relationship(type => User)
  addedByUser!: User
}
