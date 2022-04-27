import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm'
import { Serializable } from '../decorators/WebOrmDecorators'
import TimestampedSoftDelete from '../base/TimestampedSoftDelete'

@Entity()
export default class GeoType extends TimestampedSoftDelete {
  @PrimaryGeneratedColumn('uuid') @Serializable
  id: string

  @Column({ nullable: true, type: 'uuid' }) @Serializable
  parentId: string

  @Column('uuid') @Serializable
  studyId: string

  @Column('text') @Serializable
  name: string

  @Column('boolean') @Serializable
  canUserAdd: boolean

  @Column('boolean') @Serializable
  canUserAddChild: boolean

  @Column('boolean') @Serializable
  canContainRespondent: boolean

  fromSnakeJSON (json) {
    super.fromSnakeJSON(json)
    this.canUserAdd = !!this.canUserAdd
    this.canUserAddChild = !!this.canUserAddChild
    this.canContainRespondent = !!this.canContainRespondent
    return this
  }
}
