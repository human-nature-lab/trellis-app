import { i18n } from '../i18n'

const SECOND = 1000
const MINUTE = 60 * SECOND
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR
const WEEK = 7 * DAY
const YEAR = DAY * 365
const units: [number, string][] = [
  [YEAR, 'year'],
  [WEEK, 'week'],
  [DAY, 'day'],
  [HOUR, 'hour'],
  [MINUTE, 'minute'],
  [SECOND, 'second'],
]

export function humanizeMillis (millis: number): string {
  let res = ''
  if (millis < 0) {
    millis = -millis
    res = '-'
  }
  let hasStarted = false
  for (const unit of units) {
    if (millis >= unit[0]) {
      const v = Math.floor(millis / unit[0])
      if (hasStarted) {
        res += ' '
      }
      res += i18n.tc(unit[1], v)
      millis -= v * unit[0]
      if (millis === 0) {
        break
      }
      hasStarted = true
    }
  }
  return res
}

export function humanizeDateDiff (from: Date, to: Date): string {
  return humanizeMillis(to.getTime() - from.getTime())
}
