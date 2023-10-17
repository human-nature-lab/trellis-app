import { locale } from '@/services/DateService'
import { parse, formatDistanceToNow, format } from 'date-fns'

export function relativeTime (val: string | Date) {
  if (typeof val === 'string') {
    val = parse(val + '+0000', 'yyyy-MM-dd kk:mm:ssxx', new Date())
  }
  return formatDistanceToNow(val, { addSuffix: true, locale })
}

export function dateFormat (val: Date, dateFormat = 'Pp') {
  return format(val, dateFormat, { locale })
}
