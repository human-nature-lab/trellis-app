import { format, parse } from 'date-fns'
import { enUS, es } from 'date-fns/locale'
export const LARAVEL_DATE = 'yyyy-MM-dd HH:mm:ss'
export const l_DATE = 'P' // momentjs 'l' format
export const llll_DATE = 'cccc, PPp' // momentjs 'llll' format

export let locale = enUS
const locales = { en: enUS, es }

export function setLocale (code: string) {
  if (code in locales) {
    locale = locales[code]
  } else {
    throw new Error('invalid locale of ' + code)
  }
}
/**
 * Converts a date object into our applications serialized date format
 */
export function dateFormat (date: Date) {
  return format(date, LARAVEL_DATE)
}

/**
 * Returns the current datetime as a moment object
 */
export function now () {
  const d = new Date()
  d.toJSON = function () {
    return dateFormat(this)
  }
  return d
}

/**
 * Returns a copy of a date with formatting preserved
 */
export function copyDate (date: Date) {
  const newDate = new Date(date)
  newDate.toJSON = function () {
    return dateFormat(this)
  }
  return newDate
}

/**
 * Returns the current datetime as a formatted string
 */
export function nowStr () {
  return dateFormat(now())
}
/**
 * Creates a Date object from our applications date format string and makes sure it serializes back correctly
 */
export function parseDate (date: string): Date {
  const d = parse(date, LARAVEL_DATE, new Date())
  d.toJSON = function () {
    return dateFormat(this)
  }
  return d
}

export default {
  now,
  nowStr,
  parseDate,
  dateFormat,
}
