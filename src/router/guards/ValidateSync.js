import SyncService from '../../services/SyncService'
import SingletonService from '../../services/SingletonService'

export default async function (to, from, next) {
  await SingletonService.hasLoaded()
  if (SingletonService.get('synced')) {
    next()
  } else if (await SyncService.hasSynced()) {
    // Store sync status in singleton to prevent database access for each route navigation
    SingletonService.set('synced', true)
    next()
  } else if (to.name !== 'Sync') {
    next({name: 'Sync', query: {to: to.fullPath}})
  } else {
    next()
  }
}
