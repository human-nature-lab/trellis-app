import {Route} from "vue-router";
import DatabaseService from '../../services/database/DatabaseService'
import {getNextRouteOrDefault} from '../'
import RouteWhitelist from "../RouteWhitelist";

export default async function (to: Route, from: Route, next: (...any) => {}) {
  const configRouteName = 'ConfigureServer'
  const ipAddress = await DatabaseService.getServerIPAddress()
  console.log('Checking for server validation', ipAddress, to.name)
  if ((!ipAddress || !ipAddress.length) && RouteWhitelist.indexOf(to.name) === -1 && to.name !== configRouteName) {
    console.log('redirecting to', configRouteName, from.name, to.name)
    next({name: configRouteName})
  } else if (ipAddress && ipAddress.length && to.name === configRouteName) {
    const nextRoute = getNextRouteOrDefault()
    console.log('redirecting to', nextRoute.name)
    next(nextRoute)
  } else {
    next()
  }
}
