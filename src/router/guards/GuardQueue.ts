import { RedirectOption, Route, RouteConfig } from 'vue-router'
import { Queue } from '../../classes/Queue'

export interface GuardConfig {
  condition: (to?: Route, from?: Route) => boolean | Promise<boolean>,
  redirect?: (to?: Route, from?: Route) => RedirectOption
}
export function guardQueue (configs: GuardConfig[]) {
  return async function (to: Route, from: Route, next: (r?: RedirectOption) => void) {
    const queue = new Queue(configs)
    let guard = queue.next()
    while (guard) {
      const isValid = await guard.condition(to, from)
      if (!isValid) {
        if (!guard.redirect) {
          // Redirect home unless otherwise specified
          return next({ name: 'Home' })
        }
        const nextRoute = guard.redirect(to, from)
        if (typeof nextRoute === 'string') {
          if (nextRoute === to.name || nextRoute === to.path) {
            return next()
          } else {
            return next(nextRoute)
          }
        } else {
          if (nextRoute.name === to.name) {
            return next()
          } else {
            return next(nextRoute)
          }
        }
      }
      guard = queue.next()
    }
    next()
  }
}
