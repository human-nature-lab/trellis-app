import { parse, formatDistanceToNow } from 'date-fns'

export function relativeTime (val: string) {
  val += '+0000'
  const d = parse(val, 'yyyy-MM-dd HH:mm:ssxxxx', new Date())
  if (isNaN(d.getTime())) {
    throw new Error('invalid date: ' + val)
  }
  return formatDistanceToNow(d, { addSuffix: true })
}
