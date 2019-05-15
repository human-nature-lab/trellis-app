import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm'
import { Relationship, Serializable } from '../decorators/WebOrmDecorators'
import TimestampedSoftDelete from '../base/TimestampedSoftDelete'
import User from './User'

@Entity()
export default class Device extends TimestampedSoftDelete {
  @PrimaryGeneratedColumn() @Serializable
  id: string
  @Column() @Serializable
  deviceId: string
  @Column() @Serializable
  name: string
  @Column() @Serializable
  key!: string

  @Relationship(type => User)
  addedByUser!: User
}
