import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm'
import { Serializable } from '../decorators/WebOrmDecorators'
import SparseTimestampedSoftDelete from '../base/SparseTimestampedSoftDelete'

@Entity()
export default class SectionSkip extends SparseTimestampedSoftDelete {
  @PrimaryGeneratedColumn('uuid') @Serializable
  id: string

  @Column('uuid') @Serializable
  sectionId: string

  @Column('uuid') @Serializable
  skipId: string
}
