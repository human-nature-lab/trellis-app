import moment from "moment"

type Data = { labels: string[], data: number[] }

export function homogenizeDates (data: Data, min?: string, max?: string, format = 'YYYY-MM-DD'): Data {

  if (!data.labels.length) return data

  const dateCursor = moment(min || data.labels[0], format)
  const endDate = moment(max || data.labels[data.labels.length - 1], format)
  const numDates = endDate.diff(dateCursor, 'days') + 1 
  const out: Data = {
    labels: new Array(numDates).fill(''),
    data: new Array(numDates).fill(0)
  }

  let cursor = 0
  for (let i = 0; i < numDates; i++) {
    const dateCursorString = dateCursor.format(format)
    out.labels[i] = dateCursorString
    if (data.labels[cursor] === dateCursorString) {
      out.data[i] = data.data[cursor]
      cursor++
    }
    dateCursor.add(1, 'day')
  }

  return out
}