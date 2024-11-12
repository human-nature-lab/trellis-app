import { parse } from 'date-fns'

export function parseFormats (val: string, formats: string[], date: Date): Date {
  let err: Error
  for (const f of formats) {
    try {
      return parse(val, f, date)
    } catch (e) {
      err = e
    }
  }
  throw err
}
