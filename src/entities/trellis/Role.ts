import { Entity, Column, PrimaryColumn } from 'typeorm'
import TimestampedSoftDelete from '../base/TimestampedSoftDelete'
import { Relationship, Serializable } from '../decorators/WebOrmDecorators'
import RolePermission from './RolePermission'

@Entity()
export default class Role extends TimestampedSoftDelete {
  @PrimaryColumn() @Serializable
  id: string
  @Column() @Serializable
  name: string
  @Column() @Serializable
  canDelete: boolean
  @Column() @Serializable
  canEdit: boolean

  @Relationship(type => RolePermission)
  permissions: RolePermission[]
}
