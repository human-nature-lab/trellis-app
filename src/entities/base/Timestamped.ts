import {AsDate, CreateDateColumn, UpdateDateColumn} from "../TypeOrmDecorators";
import BaseEntity from './BaseEntity'

export default abstract class Timestamped extends BaseEntity {
  @CreateDateColumn({ type: 'datetime' }) @AsDate
  createdAt: Date

  @UpdateDateColumn({ type: 'datetime' }) @AsDate
  updatedAt: Date
}
