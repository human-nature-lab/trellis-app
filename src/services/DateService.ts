import moment, { Moment } from 'moment'
import 'moment/min/locales.min'
export const DATE_FORMAT = 'YYYY-MM-DD HH:mm:ss'

/**
 * Returns the current datetime as a moment object
 * @returns {moment.Moment}
 */
export function now (): Moment {
  let d = moment()
  d.toJSON = function () {
    return dateFormat(this)
  }
  return d
}

/**
 * Returns a copy of a date with formatting preserved
 * @param date
 * @returns {*}
 */
export function copyDate (date: Date): Moment {
  let newDate = moment(date)
  newDate.toJSON = function () {
    return dateFormat(this)
  }
  return newDate
}

/**
 * Returns the current datetime as a formatted string
 * @returns {string}
 */
export function nowStr () {
  return dateFormat(now())
}

/**
 * Converts a date object into our applications serialized date format
 * @param {moment.Moment|Date} date - The date object
 * @returns {string} - The serialized datte
 */
export function dateFormat (date: Moment | Date) {
  if (!moment.isMoment(date)) {
    return moment(date).format(DATE_FORMAT)
  } else {
    return date.format(DATE_FORMAT)
  }
}

/**
 * Creates a moment date object from our applications date format string
 * @param {string} date - The date from the db
 * @returns {*|moment.Moment}
 */
export function parseDate (date) {
  let d = moment.utc(date, DATE_FORMAT)
  d.toJSON = function () {
    return dateFormat(this)
  }
  return d
}

export default {
  now,
  nowStr,
  parseDate,
  dateFormat
}
