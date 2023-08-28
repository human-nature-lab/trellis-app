import { ref } from 'vue'
import { QueuableRoute, sanitizeRoute } from './sanitizeRoute'
import { Route } from 'vue-router'

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
// TODO: limit to a certain length

export function pushHistory (route: QueuableRoute, title?: string) {
  if (route.name === 'HistoryView') {
    return
  }
  setTimeout(() => {
    if (!title) {
      title = document.title
    }
    route = sanitizeRoute(route)
    history.value.push({
      route,
      timestamp: Date.now(),
      title,
    })
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(history.value))
    } catch (e) {
      console.error('Failed to save history to localStorage', e)
    }
  })
}
