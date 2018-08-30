import {Entity, Column, PrimaryGeneratedColumn} from 'typeorm'
import {Serializable} from '../decorators/WebOrmDecorators'
import TimestampedSoftDelete from '../base/TimestampedSoftDelete'

@Entity()
export default class GeoType extends TimestampedSoftDelete {
  @PrimaryGeneratedColumn() @Serializable
  id: string
  @Column({ nullable: true }) @Serializable
  parentId: string
  @Column() @Serializable
  studyId: string
  @Column() @Serializable
  name: string
  @Column() @Serializable
  canUserAdd: boolean
  @Column() @Serializable
  canUserAddChild: boolean
  @Column() @Serializable
  canContainRespondent: boolean
}
