import singleton from '../static/singleton'
import router from '../router'

/**
 * Creates a mixin which takes a loadCallback and will call the hydrate method at the appropriate times. This mixin is
 * used to avoid repeating route based methods and it syncs with the app loading progress bar.
 * @param {Function} loadCallback - This is passed the route object to load
 * @param {Function} [clearCallback] - This should clear the object
 * @returns {{beforeRouteEnter(*=, *, *): void, beforeRouteUpdate(*=, *, *): void, beforeRouteLeave(*, *, *): void}}
 */
export default function RoutePreloadMixin (loadCallback) {
  let data
  return {
    router,
    created () {
      this.hydrate(data)
      singleton.loading.error = null
    },
    async beforeRouteEnter (to, from, next) {
      singleton.loading.indeterminate = true
      singleton.loading.active = true
      try {
        data = await loadCallback(to)
        next()
      } catch (err) {
        console.error('Unable to load route:', to)
        console.error(err)
        singleton.loading.error = err.toString()
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
        console.error('Unable to update route:', to)
        console.error(err)
        singleton.loading.error = err.toString()
      } finally {
        singleton.loading.active = false
        next()
      }
    },
    async beforeRouteLeave (to, from, next) {
      singleton.loading.active = true
      singleton.loading.message = 'Validating guards...'
      try {
        if (this.leaving) {
          await this.leaving()
        }
      } catch (err) {
        console.error('Error leaving:', to)
        console.error(err)
      } finally {
        next()
      }
    }
  }
}
