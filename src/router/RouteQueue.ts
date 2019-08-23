import * as VueRouter from 'vue-router'
import { copyWhitelist } from '../services/JSONUtil'

type QueuableRoute = {
  name?: string
  path?: string
  query?: {
    [key: string]: any
    q?: string[]
  }
  params?: {[key: string]: any}
}

export class RouteQueue {

  private isLoaded = false
  private queue: QueuableRoute[] = []
  private queueName = 'q'

  constructor (private router: VueRouter, private defaultRoute) {}

  private load () {
    if (!this.isLoaded) {
      if (this.router.currentRoute && this.router.currentRoute.query && this.router.currentRoute.query[this.queueName]) {
        this.queue = JSON.parse(this.router.currentRoute.query[this.queueName])
      }
      this.isLoaded = true
    }
  }

  setDefault (route: QueuableRoute) {
    this.defaultRoute = route
  }

  private mergeRouteQueue (route: QueuableRoute) {
    if (route && !route.query) {
      route.query = {}
    }
    route.query[this.queueName] = JSON.stringify(this.queue)
  }

  push (nextRoute: QueuableRoute) {
    this.queue.push(nextRoute)
    const route = copyWhitelist(this.router.currentRoute, ['name', 'path', 'params', 'query'])
    this.mergeRouteQueue(this.router.currentRoute)
    this.router.replace(route)
    return this
  }

  unshift (route: QueuableRoute) {
    const currentRoute = copyWhitelist(this.router.currentRoute, ['name', 'path', 'params', 'query'])
    this.queue.unshift(currentRoute)
    this.mergeRouteQueue(route)
    this.router.replace(route)
    return this
  }

  next () {
    const route = this.queue.shift()
    if (route) {
      this.mergeRouteQueue(route)
      this.router.push(route)
    } else {
      this.router.push(this.defaultRoute)
    }
  }

}
