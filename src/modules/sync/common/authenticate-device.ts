import SyncService from '@/services/SyncService'
import DeviceService from '@/services/device'
import { Step, Controller } from '..'

export async function authenticateDevice (_: any, ctrl: Controller) {
  const deviceId = await DeviceService.getUUID()
  await SyncService.authenticate(ctrl.source, deviceId)
  return { deviceId }
}
