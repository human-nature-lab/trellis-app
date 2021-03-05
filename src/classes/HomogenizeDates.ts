import moment from "moment"

type Data = { labels: string[], data: number[] }

export function homogenizeDates (data: Data, format = 'YYYY-MM-DD'): Data {

  if (!data.labels.length) return data

  const currentDate = moment(data.labels[0], format)
  const endDate = moment(data.labels[data.labels.length - 1], format)
  const numDates = endDate.diff(currentDate, 'days') + 1 
  console.log('numDates', numDates)
  const out: Data = {
    labels: new Array(numDates).fill(''),
    data: new Array(numDates).fill(0)
  }

  let cursor = 0
  for (let i = 0; i < numDates; i++) {
    const currentDateString = currentDate.format(format)
    out.labels[i] = currentDateString
    if (data.labels[cursor] === currentDateString) {
      out.data[i] = data.data[cursor]
      cursor++
    }
    currentDate.add(1, 'day')
  }

  return out
}