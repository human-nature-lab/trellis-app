import { Entity, Column, PrimaryColumn } from 'typeorm'
import { Serializable } from '../decorators/WebOrmDecorators'
import BaseEntity from '../base/BaseEntity'

@Entity()
export default class Permission extends BaseEntity {
  @PrimaryColumn('uuid') @Serializable
  id: string

  @Column('text') @Serializable
  type: string

  @Column('text') @Serializable
  description: string
}
