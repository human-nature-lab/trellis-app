import singleton from '../static/singleton'

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
    created () {
      this.hydrate(data)
      singleton.loading.error = null
    },
    beforeRouteEnter (to, from, next) {
      singleton.loading.indeterminate = true
      singleton.loading.active = true
      loadCallback(to).then(d => {
        data = d
        next()
      }).catch(err => {
        console.error(err)
        singleton.loading.error = err.toString()
      }).finally(() => {
        singleton.loading.active = false
      })
    },
    beforeRouteUpdate (to, from, next) {
      singleton.loading.active = true
      singleton.loading.indeterminate = true
      let l = () => loadCallback(to)
      let p = this.leaving ? this.leaving().then(l) : l()
      p.then(data => {
        // We're reusing the component so 'this' is defined here, but not in the routeEnter method
        this.hydrate(data)
        singleton.loading.error = null
      }).catch(err => {
        console.error(err)
        singleton.loading.error = err.toString()
      }).finally(() => {
        singleton.loading.active = false
        next()
      })
    },
    beforeRouteLeave (to, from, next) {
      singleton.loading.active = true
      singleton.loading.message = 'Validating guards...'
      if (this.leaving) {
        let p = this.leaving()
        if (p instanceof Promise) {
          this.leaving().then(next)
        } else {
          next()
        }
      } else {
        next()
      }
    }
  }
}
