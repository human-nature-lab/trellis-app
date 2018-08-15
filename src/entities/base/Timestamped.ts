import {AsDate, CreateDateColumn, UpdateDateColumn} from "../TypeOrmDecorators";
import {parseDate} from '../../services/DateService'
import BaseEntity from './BaseEntity'

export default abstract class Timestamped extends BaseEntity {
  @CreateDateColumn({ type: 'datetime' }) @AsDate
  createdAt: Date

  @UpdateDateColumn({ type: 'datetime' }) @AsDate
  updatedAt: Date

  private parseDates () {
    for (let key of this.__dates__) {
      if (this[key]) {
        this[key] = parseDate(this[key])
      }
    }
  }

  fromSnakeJSON (json: any) {
    this.parseDates()
  }
}
