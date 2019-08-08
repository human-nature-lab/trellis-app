import singleton from '../static/singleton'
import router from '../router'
import {defaultLoggingService as logger} from '../services/logging/LoggingService'
// @ts-ignore
import { AddSnack } from '../components/SnackbarQueue'
import Vue from 'vue'

/**
 * Creates a mixin which takes a loadCallback and will call the hydrate method at the appropriate times. This mixin is
 * used to avoid repeating route based methods and it syncs with the app loading progress bar.
 * @param {Function} loadCallback - This is passed the route object to load
 * @param {boolean} fullscreen - If this component may take a while to load, show a modal, full-screen, loading screen
 * @param {Function} [clearCallback] - This should clear the object
 * @returns {{beforeRouteEnter(*=, *, *): void, beforeRouteUpdate(*=, *, *): void, beforeRouteLeave(*, *, *): void}}
 */
export default function RoutePreloadMixin (loadCallback: Function, fullscreen: boolean = false) {
  let data
  return Vue.extend({
    router,
    created (this: Vue) {
      this.hydrate(data)
      singleton.loading.error = null
    },
    async beforeRouteEnter (to, from, next) {
      singleton.loading.indeterminate = true
      singleton.loading.active = true
      // @ts-ignore
      singleton.loading.fullscreen = fullscreen
      try {
        data = await loadCallback(to)
        next()
      } catch (err) {
        err.component = err.component || 'RoutePreloadMixin.js@beforeRouteEnter'
        this.logError(err, `Unable to enter route: ${to.name}`)
      } finally {
        singleton.loading.active = false
      }
    },
    async beforeRouteUpdate (to, from, next) {
      singleton.loading.active = true
      singleton.loading.indeterminate = true
      if (this.leaving) {
        await this.leaving()
      }
      try {
        let routeData = await loadCallback(to)
        this.hydrate(routeData)
        singleton.loading.error = null
      } catch (err) {
        if (this.isNotAuthError(err)) {
          err.component = err.component || 'RoutePreloadMixin.js@beforeRouteUpdate'
          this.logError(err, `Unable to update route: ${to.name}`)
        }
      } finally {
        singleton.loading.active = false
        next()
      }
    },
    async beforeRouteLeave (this: Vue, to, from, next) {
      try {
        if (this.leaving) {
          await this.leaving()
        }
      } catch (err) {
        if (this.isNotAuthError(err)) {
          err.component = err.component || 'RoutePreloadMixin.js@beforeRouteLeave'
          this.logError(err, `Unable to leave route: ${from.name}`)
        }
      } finally {
        next()
      }
    }
  })
}
