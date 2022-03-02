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
  @PrimaryGeneratedColumn() @Serializable
  id: string
  @Column() @Serializable
  name: string
  @Column() @Serializable
  type: string
}
