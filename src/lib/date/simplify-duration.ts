import { Duration } from 'date-fns'

const S_YEAR = 365 * 24 * 60 * 60
const S_MONTH = 30 * 24 * 60 * 60
const S_WEEK = 7 * 24 * 60 * 60
const S_DAY = 24 * 60 * 60
const S_HOUR = 60 * 60
const S_MINUTE = 60

export function simplifyDuration (d: Duration) {
  const s = d.years * S_YEAR +
    d.months * S_MONTH +
    // d.weeks * S_WEEK +
    d.days * S_DAY +
    d.hours * S_HOUR +
    d.minutes * S_MINUTE +
    d.seconds

  console.log(s)
  if (s > 2 * S_YEAR) {
    d.months = 0
  }
  if (s > 2 * S_MONTH) {
    d.weeks = 0
  }
  if (s > 2 * S_WEEK) {
    d.days = 0
  }
  if (s > 2 * S_DAY) {
    d.hours = 0
  }
  if (s > 2 * S_HOUR) {
    d.minutes = 0
  }
  if (s > 2 * S_MINUTE) {
    d.seconds = 0
  }

  return d
}
