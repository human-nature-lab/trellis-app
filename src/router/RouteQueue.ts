import VueRouter, { Route } from 'vue-router'
import { copyWhitelist } from '../services/JSONUtil'
import StorageService from '../services/StorageService'
import { routerReady } from './index'
import { pushHistory } from './history'
import { QueuableRoute, routesAreSame } from './util'

const CURRENT_ROUTE_PROPS = ['name', 'path', 'params', 'query']

export class RouteQueue {
  private storageKey = 'route-queue'
  private queue: QueuableRoute[]
  public currentRoute: QueuableRoute

  constructor (private router: VueRouter, private defaultRoute) {
    this.queue = StorageService.get(this.storageKey)
    if (!this.queue) {
      this.queue = []
      this.saveQueue()
    }
    router.afterEach(this.afterEach)
    setTimeout(this.init.bind(this), 500)
  }

  private async init () {
    await routerReady()
    if (!this.currentRoute) {
      this.currentRoute = this.router.currentRoute
    }
  }

  setDefault (route: QueuableRoute) {
    this.defaultRoute = route
  }

  private afterEach = (to: Route, from: Route) => {
    this.setCurrentRoute(to)
    pushHistory(to)
  }

  private saveQueue () {
    StorageService.set(this.storageKey, this.queue)
  }

  private isAlreadyQueued (route: QueuableRoute): boolean {
    return this.queue.findIndex(r => routesAreSame(route, r)) > -1
  }

  private isCurrentRoute (route: QueuableRoute): boolean {
    return this.router.currentRoute && routesAreSame(this.router.currentRoute, route)
  }

  private setCurrentRoute (route: QueuableRoute) {
    this.currentRoute = copyWhitelist(route, CURRENT_ROUTE_PROPS)
  }

  push (nextRoute: QueuableRoute) {
    this.router.push(nextRoute)
    this.setCurrentRoute(nextRoute)
  }

  append (route: QueuableRoute) {
    if (!this.isAlreadyQueued(route)) {
      this.queue.push(route)
      this.saveQueue()
    }
  }

  swapFirst (route: QueuableRoute) {
    this.queue.splice(0, 1, route)
    this.saveQueue()
  }

  unshift (route: QueuableRoute) {
    if (!this.isAlreadyQueued(route)) {
      this.queue.unshift(route)
      this.saveQueue()
    }
  }

  pushAndReturnToCurrent (route: QueuableRoute) {
    const current = copyWhitelist(this.router.currentRoute, CURRENT_ROUTE_PROPS)
    this.unshift(current)
    return this.push(route)
  }

  replaceAndReturnToCurrent (route: QueuableRoute) {
    if (!routesAreSame(this.currentRoute, route)) {
      const current = copyWhitelist(this.router.currentRoute, CURRENT_ROUTE_PROPS)
      this.unshift(current)
      return this.replace(route)
    }
  }

  next (): QueuableRoute {
    const nextRoute = this.queue.shift()
    this.saveQueue()
    return nextRoute
  }

  clear () {
    this.queue = []
    this.saveQueue()
  }

  nextOrDefault () {
    const route = this.next()
    return route || this.defaultRoute
  }

  goToNext () {
    this.push(this.nextOrDefault())
  }

  resolve (route: QueuableRoute) {
    return this.router.resolve(route)
  }

  replace (route: QueuableRoute) {
    this.router.replace(route)
    this.setCurrentRoute(route)
  }

  redirect (route: QueuableRoute) {
    this.push(route)
  }

  goToNextOrPrevious () {
    const route = this.next()
    if (route) {
      this.push(route)
    } else {
      this.router.go(-1)
      this.setCurrentRoute(this.router.currentRoute)
    }
  }

  toString () {
    return this.queue
  }
}
