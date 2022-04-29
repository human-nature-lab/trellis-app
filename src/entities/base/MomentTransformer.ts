import { ValueTransformer } from 'typeorm/decorator/options/ValueTransformer'
import moment, { Moment, isMoment, isDate } from 'moment'
import { FindOperator } from 'typeorm'

export class MomentTransformer implements ValueTransformer {
  to (date: Moment | any) {
    if (date == null) return date
    else if (isMoment(date)) {
      return date.toDate()
    } else if (isDate(date)) {
      return date
    } else if (date instanceof FindOperator) {
      return date
    } else {
      console.log('invalid type being sent to db', date)
      return date
    }
  }

  from (date: Date) {
    if (date === null || date === undefined) {
      return null
    }
    return moment(date)
  }
}

export default new MomentTransformer()
