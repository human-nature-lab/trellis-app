import SyncService from '@/services/SyncService'
import DeviceService from '@/services/device'
import { StepController } from '../controller'
import DatabaseService from '@/services/database'
import { i18n } from '@/i18n'
import config from '@/config'
import { TaskExecution } from './task'
import axios from 'axios'

export async function authenticateDevice (_, ctrl: TaskExecution) {
  const deviceId = await DeviceService.getUUID()
  const source = axios.CancelToken.source()
  ctrl.onCancel(() => source.cancel())
  await SyncService.authenticate(source, deviceId)
  return { deviceId }
}

export async function checkConnection (_, ctrl: TaskExecution) {
  const apiRoot = await DatabaseService.getServerIPAddress()
  try {
    const source = axios.CancelToken.source()
    ctrl.onCancel(() => source.cancel())
    await SyncService.getHeartbeat(source)
  } catch (err) {
    ctrl.log.error(i18n.t('unable_to_establish_connection', [apiRoot]))
    throw new Error(`Unable to establish connection with '${apiRoot}'`)
  }
}

export async function compareTime () {
  if (config.checkServerTime) {
    const deviceId = await DeviceService.getUUID()
    const serverTime = await SyncService.getServerTime(deviceId)
    const now = new Date()
    if (Math.abs(now.getTime() - serverTime.getTime()) > 5 * 60 * 1000) {
      throw new Error('server time does not match device time')
    }
  }
}
