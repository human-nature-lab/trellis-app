import SyncService from '../../services/SyncService'
import SingletonService from '../../services/SingletonService'
import RouteWhitelist from '../RouteWhitelist'

export default async function (to, from, next) {
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
