import { CreateDateColumn, UpdateDateColumn } from 'typeorm'
import { AsDate, Serializable } from '../decorators/WebOrmDecorators'
import BaseEntity from './BaseEntity'

export default abstract class SparseTimestamped extends BaseEntity {
  @CreateDateColumn({ select: false, type: 'datetime' }) @AsDate @Serializable
  public createdAt: Date

  @UpdateDateColumn({ select: false, type: 'datetime' }) @AsDate @Serializable
  public updatedAt: Date
}
