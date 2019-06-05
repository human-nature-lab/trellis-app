import { Entity, Column, PrimaryColumn } from 'typeorm'
import TimestampedSoftDelete from '../base/TimestampedSoftDelete'
import { Relationship, Serializable } from '../decorators/WebOrmDecorators'
import Permission from './Permission'

@Entity()
export default class RolePermission extends TimestampedSoftDelete {
  @PrimaryColumn() @Serializable
  id: string
  @Column() @Serializable
  roleId: string
  @Column() @Serializable
  permissionId: string
  @Column() @Serializable
  value: boolean

  @Relationship(type => Permission)
  permission: Permission
}
