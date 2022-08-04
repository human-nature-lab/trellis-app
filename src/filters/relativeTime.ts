import { parse, formatDistanceToNow } from 'date-fns'

export function relativeTime (val: string) {
  return formatDistanceToNow(parse(val + '+0000', 'yyyy-MM-dd kk:mm:ssxx', new Date()), { addSuffix: true })
}
