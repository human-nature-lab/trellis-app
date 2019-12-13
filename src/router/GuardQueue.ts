import { RedirectOption, Route } from 'vue-router'
import { Queue } from '../classes/Queue'
import { routeQueue } from './index'
import { QueuableRoute } from './RouteQueue'

export interface GuardConfig {
  name?: string
  condition: (to?: Route, from?: Route) => boolean | Promise<boolean>,
  redirect?: (to?: Route, from?: Route) => QueuableRoute
}
export function guardQueue (configs: GuardConfig[]) {
  return async function (to: Route, from: Route, next: (r?: RedirectOption) => void) {
    const queue = new Queue(configs)
    let guard = queue.next()
    while (guard) {
      const isValid = await guard.condition(to, from)
      console.log('guard', guard.name, 'result for', to.name, isValid)
      if (!isValid) {
        let nextRoute
        if (guard.redirect) {
          nextRoute = guard.redirect(to, from)
        }
        const toRoute = nextRoute || routeQueue.nextOrDefault()
        console.log('redirecting to', toRoute)
        return next(toRoute)
      }
      guard = queue.next()
    }
    next()
  }
}
