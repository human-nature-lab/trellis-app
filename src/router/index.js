import Vue from 'vue'
import Router from 'vue-router'
import config from '../config'
import {APP_ENV} from '../static/constants'

import appRoutes from './app.routes'
import webRoutes from './web.routes'
import sharedRoutes from './shared.routes'

let routes = sharedRoutes
if (config.appEnv === APP_ENV.WEB) {
  routes = routes.concat(webRoutes)
} else {
  routes = routes.concat(appRoutes)
}

Vue.use(Router)

export const router = new Router({
  routes: routes
})

/**
 * Add element to browser history and try to return to the current location
 * @param {Object} route
 */
export function pushRouteAndQueueCurrent (route) {
  route.query.to = router.currentRoute.fullPath
  router.push(route)
}

/**
 * Navigate to the next route if one is queued. Otherwise, run the callback.
 * @param {Function} cb
 */
export function moveToNextOr (cb) {
  let current = router.currentRoute
  if (current.query.to) {
    router.push(current.query.to)
  } else {
    cb()
  }
}

export default router
