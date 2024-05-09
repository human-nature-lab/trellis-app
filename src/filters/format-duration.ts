const SECOND_MS = 1000
const MINUTE_MS = 60 * SECOND_MS
const HOUR_MS = 60 * MINUTE_MS

export function formatDuration (timestamp: number): string {
  const hours = Math.floor(timestamp / HOUR_MS)
  const minutes = Math.floor((timestamp % HOUR_MS) / MINUTE_MS)
  const seconds = Math.floor((timestamp % MINUTE_MS) / SECOND_MS)
  const hourStr = hours > 10 ? `${hours}` : '0' + hours
  const minuteStr = minutes > 10 ? `${minutes}` : '0' + minutes
  const secondStr = seconds > 10 ? `${seconds}` : '0' + seconds
  return `${hourStr}:${minuteStr}:${secondStr}`
}
