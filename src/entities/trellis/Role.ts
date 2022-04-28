import { Entity, Column, PrimaryColumn } from 'typeorm'
import TimestampedSoftDelete from '../base/TimestampedSoftDelete'
import { Relationship, Serializable } from '../decorators/WebOrmDecorators'
import RolePermission from './RolePermission'

@Entity()
export default class Role extends TimestampedSoftDelete {
  @PrimaryColumn('uuid') @Serializable
  id: string

  @Column('text') @Serializable
  name: string

  @Column('boolean') @Serializable
  canDelete: boolean

  @Column('boolean') @Serializable
  canEdit: boolean

  @Relationship(type => RolePermission)
  permissions: RolePermission[]
}
