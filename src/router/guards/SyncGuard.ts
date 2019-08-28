import { Route } from 'vue-router'
import SyncService from '../../services/SyncService'
import SingletonService from '../../services/SingletonService'
import RouteWhitelist from '../RouteWhitelist'

export async function oldGuard (to, from, next) {
  await SingletonService.hasLoaded()
  console.log('checking sync', SingletonService.get('synced'))
  const routeName = 'Sync'
  if (SingletonService.get('synced')) {
    next()
  } else if (await SyncService.hasSynced() ) {
    // Store sync status in singleton to prevent database access for each route navigation
    SingletonService.set('synced', true)
    next()
  } else if (RouteWhitelist.indexOf(to.name) === -1 && [routeName, 'ConfigureServer', 'RegisterDevice'].indexOf(to.name) === -1) {
    console.log('redirecting to', routeName)
    next({name: routeName, query: {to: to.fullPath}})
  } else {
    next()
  }
}

export default {
  name: 'SyncGuard',
  async condition () {
    if (SingletonService.get('synced')) {
      return true
    } else if (await SyncService.hasSynced()) {
      SingletonService.set('synced', true)
      return true
    }
    return false
  },
  redirect () {
    return { name: 'Sync' }
  }
}
