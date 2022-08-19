import SyncService from '@/services/SyncService'
import DeviceService from '@/services/device'

export async function compareTime () {
  const deviceId = await DeviceService.getUUID()
  const serverTime = await SyncService.getServerTime(deviceId)
  const now = new Date()
  if (Math.abs(now.getTime() - serverTime.getTime()) > 5 * 60 * 1000) {
    throw new Error('server time does not match device time')
  }
}
