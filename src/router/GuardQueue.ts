import { RedirectOption, Route } from 'vue-router'
import { Queue } from '../classes/Queue'
import { routeQueue } from './index'
import { QueuableRoute } from './util'

export interface GuardConfig {
  name?: string
  condition: (to?: Route, from?: Route) => boolean | Promise<boolean>,
  redirect?: (to?: Route, from?: Route) => QueuableRoute
  failed?: (to?: Route, from?: Route) => void
}
export function guardQueue (configs: GuardConfig[]) {
  return async function (to: Route, from: Route, next: (r?: RedirectOption) => void) {
    const queue = new Queue(configs)
    let guard = queue.next()
    while (guard) {
      const isValid = await guard.condition(to, from)
      if (!isValid) {
        if (guard.failed) {
          guard.failed(to, from)
        }
        let nextRoute
        if (guard.redirect) {
          nextRoute = guard.redirect(to, from)
        }
        const toRoute = nextRoute || { path: '/'}
        routeQueue.swapFirst({
          path: to.fullPath
        })
        console.log('toRoute', toRoute)
        return next(toRoute)
      }
      guard = queue.next()
    }
    next()
  }
}
