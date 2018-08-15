import { CreateDateColumn, UpdateDateColumn } from "typeorm";
import {parseDate} from '../../services/DateService'

export default abstract class Timestamped {
  @CreateDateColumn({ type: "datetime" })
  createdAt: Date

  @UpdateDateColumn({ type: "datetime" })
  updatedAt: Date

  protected _dates: string[]
  protected _colNames: string[]

  constructor () {
    this._dates = ['createdAt', 'updatedAt']
    this._colNames = ['createdAt', 'updatedAt']
  }

  fromSnakeJSON (json: any) {
    for (let key of this._dates) {
      if (this[key]) {
        this[key] = parseDate(this[key])
      }
    }
  }
}
