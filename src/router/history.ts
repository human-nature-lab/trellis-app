import { computed, ref, watch } from 'vue'
import { QueuableRoute, sanitizeRoute } from './util'
import { i18n } from '@/i18n'
import config from '../config'
import { APP_ENV } from '../static/constants'

export type Title = string | { key: string, params?: any[] } | { translationId: string }
const ignoredRoutes = [
  'HistoryView',
  'Sync',
  'SyncAdmin',
  'Login',
  'Home',
  'StudySelector',
  'LocaleSelector',
  'Information',
  'Documentation',
]

export type HistoryItem = {
  route: QueuableRoute
  timestamp: number
  title?: Title
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
  if (config.appEnv !== APP_ENV.CORDOVA) {
    return
  }
  const timestamp = Date.now()
  if ((timestamp - prevTimestamp) < 500 || ignoredRoutes.includes(route.name)) {
    return
  }
  prevTimestamp = timestamp
  if (!title) {
    title = route.name
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
}

export async function evalTitle (title: Title) {
  if (typeof title === 'string') {
    return title
  } else if ('key' in title) {
    return i18n.t(title.key, title.params) as string
  } else {
    // TODO: this should be translated
    return title.translationId
  }
}

export async function updateTitle (newTitle: Title) {
  if (config.appEnv !== APP_ENV.CORDOVA) {
    return
  }
  const route = history.value[0]
  if (route) {
    route.title = newTitle
  }
  document.title = await evalTitle(newTitle)
  console.log('Updated title to', newTitle)
}

export function computedTitle (fn: () => Title) {
  const title = computed(fn)
  watch(() => title.value, updateTitle, { immediate: true })
}

export function clearHistory () {
  history.value = []
  localStorage.removeItem(HISTORY_KEY)
}

export function removeHistoryItem (index: number) {
  history.value.splice(index, 1)
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history.value))
}
