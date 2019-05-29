import { Entity, Column, PrimaryColumn } from 'typeorm'
import { Serializable } from '../decorators/WebOrmDecorators'
import BaseEntity from '../base/BaseEntity'

@Entity()
export default class Permission extends BaseEntity {
  @PrimaryColumn() @Serializable
  id: string
  @Column() @Serializable
  type: string
  @Column() @Serializable
  description: string
}
