import { Mutex } from 'async-mutex'
import Vue from 'vue'
import Router from 'vue-router'
import { defaultLoggingService as logger } from '../services/logging'
import singleton from '../static/singleton'
import SyncGuard from './guards/SyncGuard'
import LoginGuard from './guards/LoginGuard'
import { guardQueue } from './GuardQueue'

import routes from './routes'
import { RouteQueue } from './RouteQueue'
import { LoggingLevel } from '../services/logging/LoggingTypes'
import { AddSnack } from '../components/SnackbarQueue.vue'
import PhotoService from '../services/photo'

Vue.use(Router)

console.log('routes', routes)

export const router = new Router({
  routes,
  mode: 'hash',
  scrollBehavior (to, from, savedPosition) {
    return { x: 0, y: 0 }
  }
})

export const routeQueue = new RouteQueue(router, { name: 'Home' })

// If we're in offline mode, require that the application is synced
if (singleton.offline) {
  router.beforeEach(guardQueue([SyncGuard]))
} else {
  router.beforeEach((to, from, next) => {
    if (to && to.query && to.query.key !== undefined) {
      singleton.maintenanceKey = to.query.key
    } else if (from && from.query && from.query.key !== undefined) {
      singleton.maintenanceKey = from.query.key
    }
    next()
  })
}

// Always require we're logged in
// router.beforeEach(guardQueue([LoginGuard]))

router.beforeEach((to, from, next) => {
  // Don't let photo requests prevent navigation from happening by cancelling outstanding requests
  PhotoService.cancelAllOutstanding()
  if (to.name !== from.name) {
    // Moving to new page, loading
    singleton.loading.indeterminate = true
    singleton.loading.active = true
  }
  logger.log({
    component: 'router/index.js@beforeEach',
    message: `before navigating to: ${to.fullPath}`,
    severity: LoggingLevel.debug
  })
  setTimeout(next)
})

router.afterEach((to) => {
  singleton.loading.active = false
  console.log('to', to)
  logger.log({
    component: 'router/index.js@afterEach',
    message: `after navigating to: ${to.fullPath}`,
    severity: LoggingLevel.debug
  })
})

router.onReady(() => {
  logger.log({
    component: 'router/index.js@onReady',
    message: 'onReady',
    severity: LoggingLevel.debug
  })
})

router.onError(err => {
  console.error(err)
  err.severity = LoggingLevel.error
  err.component = err.component ? err.component : 'router/index.js@onError'
  logger.log(err)
  AddSnack('Unable to load route', {timeout: 0})
  singleton.loading.active = false
  throw err
})

/**
 * Returns a Promise that can be awaited to determine if the router is ready. This is used primarily to ensure that
 */
const readyMutex = new Mutex()
let isReady = false
export function routerReady () {
  return new Promise(async resolve => {
    const release = await readyMutex.acquire()
    if (isReady) {
      release()
      return resolve(true)
    }
    function check () {
      // @ts-ignore
      if (router.history.ready) {
        isReady = true
        clearInterval(intervalId)
        clearTimeout(timeoutId)
        release()
        resolve(true)
      }
    }
    const intervalId = setInterval(check, 300)
    const timeoutId = setTimeout(() => {
      release()
      isReady = true
      clearInterval(intervalId)
      resolve(false)
    }, 1000)
    check()
  })
}

export default router
