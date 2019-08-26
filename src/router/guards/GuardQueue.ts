import { RedirectOption, Route } from 'vue-router'
import { Queue } from '../../classes/Queue'
import { routeQueue } from '../index'
import { QueuableRoute } from '../RouteQueue'

export interface GuardConfig {
  condition: (to?: Route, from?: Route) => boolean | Promise<boolean>,
  redirect?: (to?: Route, from?: Route) => QueuableRoute
}
export function guardQueue (configs: GuardConfig[]) {
  return async function (to: Route, from: Route, next: (r?: RedirectOption) => void) {
    const queue = new Queue(configs)
    let guard = queue.next()
    while (guard) {
      const isValid = await guard.condition(to, from)
      if (!isValid) {
        const nextRoute = guard.redirect(to, from)
        if (nextRoute) {
          await routeQueue.unshift(nextRoute)
        }
        // routeQueue.unshift(nextRoute)
        // if (typeof nextRoute === 'string') {
        //   if (nextRoute === to.name || nextRoute === to.path) {
        //     return next()
        //   } else {
        //     return next(nextRoute)
        //   }
        // } else {
        //   if (nextRoute.name === to.name) {
        //     return next()
        //   } else {
        //     return next(nextRoute)
        //   }
        // }
      }
      guard = queue.next()
    }
    next()
  }
}
