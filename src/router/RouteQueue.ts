import * as VueRouter from 'vue-router'
import { copyWhitelist } from '../services/JSONUtil'
import { routerReady } from './index'
import merge from 'lodash/merge'

export type QueuableRoute = {
  name?: string
  path?: string
  query?: {
    [key: string]: any
    q?: string[]
  }
  params?: {[key: string]: any}
}

const CURRENT_ROUTE_PROPS = ['name', 'path', 'params', 'query']

export class RouteQueue {

  private isLoaded = false
  private queue: QueuableRoute[] = []
  private queueName = 'q'

  constructor (private router: VueRouter, private defaultRoute) {}

  private async load () {
    if (!this.isLoaded) {
      await routerReady()
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
    if (!route) return
    if (!route.query) {
      route.query = {}
    }
    route.query[this.queueName] = JSON.stringify(this.queue)
  }

  private isAlreadyQueued (route: QueuableRoute): boolean {
    return this.queue.findIndex(r => (route.name && r.name === route.name) || (route.path && r.path === route.path)) > -1
  }

  private isCurrentRoute (route: QueuableRoute): boolean {
    return this.router.currentRoute &&
      ((this.router.currentRoute.name && this.router.currentRoute.name === route.name) ||
        (this.router.currentRoute.path && this.router.currentRoute.path === route.path))
  }

  async push (nextRoute: QueuableRoute) {
    await this.load()
    if (this.isAlreadyQueued(nextRoute)) return
    this.queue.push(nextRoute)
    const route = copyWhitelist(this.router.currentRoute, CURRENT_ROUTE_PROPS)
    this.mergeRouteQueue(route)
    this.router.push(route)
    return this
  }

  async unshift (route: QueuableRoute) {
    await this.load()
    const currentRoute = copyWhitelist(this.router.currentRoute, CURRENT_ROUTE_PROPS)
    const isAlreadyQueued = this.isAlreadyQueued(currentRoute)
    const isCurrentRoute = this.isCurrentRoute(route)
    console.log('currentRoute', currentRoute, 'nextRoute', route, 'isQueued', isAlreadyQueued, 'isCurrent', isCurrentRoute)
    if (isCurrentRoute) return
    if (currentRoute.query) {
      delete currentRoute.query[this.queueName]
    }
    this.queue.unshift(currentRoute)
    this.mergeRouteQueue(route)
    this.router.replace(JSON.parse(JSON.stringify(route)))
    return this
  }

  next (): QueuableRoute {
    const route = this.queue.shift()
    this.mergeRouteQueue(route)
    return route
  }

  goToNext () {
    const route = this.next()
    if (route) {
      this.router.push(route)
    } else {
      this.router.push(this.defaultRoute)
    }
  }

  replaceAndMerge (route: QueuableRoute) {
    // @ts-ignore
    route.replace = true
    this.pushAndMerge(route)
  }

  resolve (route: QueuableRoute) {
    const res = this.router.resolve(route)
    return this.withQueue(res)
  }

  withQueue (route: QueuableRoute) {
    return merge(copyWhitelist(this.router.currentRoute, ['query']), route)
  }

  pushAndMerge (route: QueuableRoute) {
    this.router.push(merge(copyWhitelist(this.router.currentRoute, CURRENT_ROUTE_PROPS), route))
  }

  replace (route: QueuableRoute) {
    this.router.replace(route)
  }

  redirect (route: QueuableRoute) {
    this.router.push(route)
  }

  goToNextOrPrevious () {
    const route = this.next()
    if (route) {
      this.router.push(route)
    } else {
      this.router.go(-1)
    }
  }

}
