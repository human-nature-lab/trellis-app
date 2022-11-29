import SyncService from '@/services/SyncService'
import DeviceService from '@/services/device'
import { StepController } from '../controller'
import DatabaseService from '@/services/database'
import { i18n } from '@/i18n'
import config from '@/config'

export async function authenticateDevice (ctrl: StepController) {
  const deviceId = await DeviceService.getUUID()
  await SyncService.authenticate(ctrl.source, deviceId)
  return { deviceId }
}

export async function checkConnection (ctrl: StepController) {
  const apiRoot = await DatabaseService.getServerIPAddress()
  try {
    await SyncService.getHeartbeat(ctrl.source)
  } catch (err) {
    ctrl.log.error(i18n.t('unable_to_establish_connection', [apiRoot]))
    throw new Error(`Unable to establish connection with '${apiRoot}'`)
  }
}

export async function compareTime () {
  if (config.compareTime) {
    const deviceId = await DeviceService.getUUID()
    const serverTime = await SyncService.getServerTime(deviceId)
    const now = new Date()
    if (Math.abs(now.getTime() - serverTime.getTime()) > 5 * 60 * 1000) {
      throw new Error('server time does not match device time')
    }
  }
}
