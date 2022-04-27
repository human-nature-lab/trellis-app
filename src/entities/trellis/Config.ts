import { Entity, Column, PrimaryColumn } from 'typeorm'
import BaseEntity from '../base/BaseEntity'
import { Serializable } from '../decorators/WebOrmDecorators'

@Entity()
export default class Config extends BaseEntity {
  @PrimaryColumn('uuid') @Serializable
  key: string

  @Column('text') @Serializable
  value: string

  @Column('text') @Serializable
  type: string

  @Column('text') @Serializable
  defaultValue: string
}
