import { Route } from 'vue-router'
import { getNextRouteOrDefault } from '../'
import DeviceService from '../../services/device/DeviceService'
import RouteWhitelist from '../RouteWhitelist'
const routeName = 'RegisterDevice'



export default async function (to: Route, from: Route, next: (...any) => {}) {
  const key = await DeviceService.getDeviceKey()
  console.log('Checking device key', key, to.name)
  if (to.name !== routeName && (!key || !key.length || RouteWhitelist.indexOf(to.name) === -1)) {
    console.log('redirecting to', routeName)
    next({name: routeName})
  } else if (key && key.length && to.name === routeName) {
    // Don't allow access to this page once we've configured it
    const nextRoute = getNextRouteOrDefault()
    console.log('redirecting to', nextRoute)
    return next(nextRoute)
  } else {
    next()
  }
}
