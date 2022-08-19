import SyncService from '@/services/SyncService'
import DatabaseService from '@/services/database'
import { Controller } from '..'
import { i18n } from '@/i18n'

export async function checkConnection (_: any, ctrl: Controller) {
  const apiRoot = await DatabaseService.getServerIPAddress()
  try {
    await SyncService.getHeartbeat(ctrl.source)
  } catch (err) {
    ctrl.log.error(i18n.t('unable_to_establish_connection', [apiRoot]))
    throw new Error(`Unable to establish connection with '${apiRoot}'`)
  }
  return null
}
