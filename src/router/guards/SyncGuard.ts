import { Route } from 'vue-router'
import SyncService from '../../services/SyncService'
import SingletonService from '../../services/SingletonService'
import RouteWhitelist from '../RouteWhitelist'

export default {
  name: 'SyncGuard',
  async condition (to: Route) {
    if (RouteWhitelist.indexOf(to.name) > -1) return true
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
