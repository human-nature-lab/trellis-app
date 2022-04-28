import DatabaseService from '../../services/database'
import { isUndefined } from '../../services/util'
import { GuardConfig } from '../GuardQueue'

export default {
  name: 'ServerConfigGuard',
  async condition () {
    const ipAddress = await DatabaseService.getServerIPAddress()
    return !isUndefined(ipAddress) && !!ipAddress.length
  },
  redirect () {
    return { name: 'ConfigureServer' }
  }
} as GuardConfig
