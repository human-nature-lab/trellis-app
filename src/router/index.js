import Vue from 'vue'
import Router from 'vue-router'
import singleton from '../static/singleton'
import ValidateSync from './guards/ValidateSync'
import ValidateLogin from './guards/ValidateLogin'
import chain from './guards/ChainableGuards'

import appRoutes from './app.routes'
import webRoutes from './web.routes'
import sharedRoutes from './shared.routes'

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
  console.log('before navigating to', to)
  setTimeout(next)
})

router.afterEach((to) => console.log('after navigating to', to))

router.onReady(() => console.log('router ready'))

router.onError(err => {
  console.error('Router error:', err)
  alert('Unable to load route!')
})

/**
 * Add element to browser history and try to return to the current location
 * @param {Object} route
 */
export function pushRouteAndQueueCurrent (route) {
  if (!route.query) {
    route.query = {}
  }
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

/**
 * Replace the current route with the next route if one is queued. Otherwise, run the callback.
 * @param {Function} cb
 */
export function replaceWithNextOr (cb) {
  let current = router.currentRoute
  if (current.query.to) {
    router.replace(current.query.to)
  } else {
    cb()
  }
}

export default router
