import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm'
import { Serializable } from '../decorators/WebOrmDecorators'
import SparseTimestampedSoftDelete from '../base/SparseTimestampedSoftDelete'

export enum ParameterType {
  String = 'string',
  Number = 'number',
  Choice = 'choice',
  Boolean = 'boolean',
  ConditionTag = 'condition_tag',
  GeoType = 'geo_type',
}

@Entity()
export default class Parameter extends SparseTimestampedSoftDelete {
  @PrimaryGeneratedColumn('uuid') @Serializable
  id: string

  @Column('text') @Serializable
  name: string

  @Column('text') @Serializable
  type: string
}
