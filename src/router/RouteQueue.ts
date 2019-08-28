import * as VueRouter from 'vue-router'
import { copyWhitelist } from '../services/JSONUtil'
import StorageService from '../services/StorageService'
import { routerReady } from './index'

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

  private storageKey = 'route-queue'
  private queue: QueuableRoute[]
  public currentRoute: QueuableRoute

  constructor (private router: VueRouter, private defaultRoute) {
    this.queue = StorageService.get(this.storageKey)
    if (!this.queue) {
      this.queue = []
      this.saveQueue()
    }
    this.init()
  }

  private async init () {
    await routerReady()
    this.currentRoute = this.router.currentRoute
  }

  setDefault (route: QueuableRoute) {
    this.defaultRoute = route
  }

  private saveQueue () {
    StorageService.set(this.storageKey, this.queue)
  }

  private isAlreadyQueued (route: QueuableRoute): boolean {
    return this.queue.findIndex(r => this.routesAreSame(route, r)) > -1
  }

  private isCurrentRoute (route: QueuableRoute): boolean {
    return this.router.currentRoute && this.routesAreSame(this.router.currentRoute, route)
  }

  private routesAreSame (routeA: QueuableRoute, routeB: QueuableRoute): boolean {
    return routeA && routeB && (routeA.name === routeB.name || routeA.path === routeB.path)
  }

  push (nextRoute: QueuableRoute) {
    this.router.push(nextRoute)
    this.currentRoute = JSON.parse(JSON.stringify(nextRoute))
  }

  append (route: QueuableRoute) {
    if (!this.isAlreadyQueued(route)) {
      this.queue.push(route)
      this.saveQueue()
    }
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
    if (!this.routesAreSame(this.currentRoute, route)) {
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
    this.currentRoute = JSON.parse(JSON.stringify(route))
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
      this.currentRoute = copyWhitelist(this.router.currentRoute, CURRENT_ROUTE_PROPS)
    }
  }

  toString () {
    return this.queue
  }

}
