import { parse, differenceInDays, format, addDays } from 'date-fns'

type Data = { labels: string[], data: number[] }

export function homogenizeDates (data: Data, min?: string, max?: string, dateFormat = 'YYYY-MM-DD'): Data {
  if (!data.labels.length) return data

  let dateCursor = parse(min || data.labels[0], dateFormat, new Date())
  const endDate = parse(max || data.labels[data.labels.length - 1], dateFormat, new Date())
  const numDates = differenceInDays(endDate, dateCursor) + 1
  const out: Data = {
    labels: new Array(numDates).fill(''),
    data: new Array(numDates).fill(0),
  }

  let cursor = 0
  for (let i = 0; i < numDates; i++) {
    const dateCursorString = format(dateCursor, dateFormat)
    out.labels[i] = dateCursorString
    if (data.labels[cursor] === dateCursorString) {
      out.data[i] = data.data[cursor]
      cursor++
    }
    dateCursor = addDays(dateCursor, 1)
  }

  return out
}
