import { CreateDateColumn, UpdateDateColumn } from 'typeorm'
import { AsDate, Serializable } from '../decorators/WebOrmDecorators'
import BaseEntity from './BaseEntity'

export default abstract class Timestamped extends BaseEntity {
  @CreateDateColumn({ type: 'datetime' }) @AsDate @Serializable
  public createdAt: Date

  @UpdateDateColumn({ type: 'datetime' }) @AsDate @Serializable
  public updatedAt: Date
}
