import { Entity, Column, PrimaryColumn } from 'typeorm'
import TimestampedSoftDelete from '../base/TimestampedSoftDelete'
import { Relationship, Serializable } from '../decorators/WebOrmDecorators'
import Permission from './Permission'

@Entity()
export default class RolePermission extends TimestampedSoftDelete {
  @PrimaryColumn('uuid') @Serializable
  id: string

  @Column('uuid') @Serializable
  roleId: string

  @Column('uuid') @Serializable
  permissionId: string

  @Column('boolean') @Serializable
  value: boolean

  @Relationship(type => Permission)
  permission: Permission
}
