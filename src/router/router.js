import Vue from 'vue'
import Router from 'vue-router'
import config from '@/config'
import {APP_ENV} from '@/constants'

import appRoutes from './app.routes'
import webRoutes from './web.routes'
import sharedRoutes from './shared.routes'

let routes = sharedRoutes
if (config.appEnv === APP_ENV.WEB) {
  routes = routes.concat(webRoutes)
} else {
  routes = routes.concat(appRoutes)
}
console.log('routes', routes)
Vue.use(Router)

export const router = new Router({
  routes: routes
})

export default router
