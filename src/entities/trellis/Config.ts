import { Entity, Column, PrimaryColumn } from 'typeorm'
import BaseEntity from '../base/BaseEntity'
import { Serializable } from '../decorators/WebOrmDecorators'

@Entity()
export default class Config extends BaseEntity {
  @PrimaryColumn() @Serializable
  key: string
  @Column() @Serializable
  value: string
  @Column() @Serializable
  type: string
  @Column() @Serializable
  defaultValue: string
}
