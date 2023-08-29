import { ref } from 'vue'
import { QueuableRoute, routesAreSame, sanitizeRoute } from './util'

export type HistoryItem = {
  route: QueuableRoute
  timestamp: number
  title?: string
}

const HISTORY_KEY = 'history'

const existingHistoryStr = localStorage.getItem(HISTORY_KEY)
let initialHistory: HistoryItem[] = []
if (existingHistoryStr) {
  try {
    initialHistory = JSON.parse(existingHistoryStr)
  } catch (e) {
    console.error('Failed to parse history from localStorage', existingHistoryStr)
  }
}
export const history = ref<HistoryItem[]>(initialHistory)

let prevTimestamp = 0
export function pushHistory (route: QueuableRoute, title?: string) {
  const timestamp = Date.now()
  if (route.name === 'HistoryView' || (timestamp - prevTimestamp) < 500) {
    return
  }
  prevTimestamp = timestamp
  setTimeout(() => {
    if (!title) {
      title = document.title
    }
    route = sanitizeRoute(route)
    history.value.unshift({
      route,
      timestamp,
      title,
    })
    if (history.value.length > 500) {
      history.value.pop()
    }
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(history.value))
    } catch (e) {
      console.error('Failed to save history to localStorage', e)
    }
  })
}

export function clearHistory () {
  history.value = []
  localStorage.removeItem(HISTORY_KEY)
}

export function removeHistoryItem (index: number) {
  history.value.splice(index, 1)
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history.value))
}
