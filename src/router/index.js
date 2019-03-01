import Vue from 'vue'
import Router from 'vue-router'
import {defaultLoggingService as logger} from '../services/logging/LoggingService'
import singleton from '../static/singleton'
import ValidateSync from './guards/ValidateSync'
import ValidateLogin from './guards/ValidateLogin'
import chain from './guards/ChainableGuards'

import appRoutes from './app.routes'
import webRoutes from './web.routes'
import sharedRoutes from './shared.routes'
import { LoggingLevel } from '../services/logging/LoggingTypes'
import {AddSnack} from '../components/SnackbarQueue'

let routes = sharedRoutes
if (singleton.offline) {
  routes = routes.concat(appRoutes)
} else {
  routes = routes.concat(webRoutes)
}

console.log('Routes', routes)

Vue.use(Router)

export const router = new Router({
  routes,
  scrollBehavior (to, from, savedPosition) {
    return { x: 0, y: 0 }
  }
})

// If we're in offline mode, require that the application is synced
if (singleton.offline) {
  router.beforeEach(chain(ValidateSync, ValidateLogin))
}

router.beforeEach((to, from, next) => {
  if (to.name !== from.name) {
    // Moving to new page, loading
    singleton.loading.indeterminate = true
    singleton.loading.active = true
    singleton.loading.fullscreen = true
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
  err.severity = LoggingLevel.error
  err.component = err.component ? err.component : 'router/index.js@onError'
  logger.log(err)
  AddSnack('Unable to load route', {timeout: 0})
  singleton.loading.active = false
  throw err
})

/**
 * Add element to browser history and try to return to the current location
 * @param {Object} route
 * @param {Object} query
 */
export function pushRouteAndQueueCurrent (route, query) {
  if (!route.query) {
    route.query = {}
  }
  if (query) {
    route.query.to = JSON.stringify({ path: router.currentRoute.fullPath, query: query })
  } else {
    route.query.to = router.currentRoute.fullPath
  }
  router.push(route)
}

/**
 * Add a route object and queue the next one avoiding duplicates
 * @param route
 * @param queued
 */
export function pushRoute (route, queued) {
  // TODO: Avoid duplicate queued routes
  if (queued) {
    if (!route.query) {
      route.query = {}
    }
    route.query.to = JSON.stringify(queued)
  }
  router.push(route)
}

/**
 * Navigate to the next route if one is queued. Otherwise, run the callback.
 * @param {Function} cb
 */
export function moveToNextOr (cb) {
  let current = router.currentRoute
  if (current.query.to) {
    let to
    try {
      to = JSON.parse(current.query.to)
    } catch (err) {
      to = current.query.to
    }
    router.push(to)
  } else {
    cb()
  }
}

/**
 * Replace the current route with the next route if one is queued. Otherwise, run the callback.
 * @param {Function} cb
 */
export function replaceWithNextOr (cb) {
  let current = router.currentRoute
  if (current.query.to) {
    let to
    try {
      to = JSON.parse(current.query.to)
    } catch (err) {
      to = current.query.to
    }
    router.replace(to)
  } else {
    cb()
  }
}

export default router
