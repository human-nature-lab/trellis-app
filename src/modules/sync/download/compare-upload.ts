import SyncService from '@/services/SyncService'
import DeviceService from '@/services/device'
import { Controller } from '..'
import { i18n } from '@/i18n'
import Snapshot from '@/entities/trellis/Snapshot'

export async function compareUpload (data: { snapshot: Snapshot }, ctrl: Controller) {
  const deviceId = await DeviceService.getUUID()
  const pendingUploads = await SyncService.getPendingUploads(ctrl.source)
  let pendingFromThisDevice = 0
  for (let i = 0; i < pendingUploads.length; i++) {
    if (pendingUploads[i].device_id === deviceId) {
      pendingFromThisDevice++
    }
  }

  if (pendingFromThisDevice > 0) {
    const proceed = await ctrl.confirm(i18n.t('pending_uploads_device', [pendingFromThisDevice]))
    if (!proceed) {
      throw new Error('Stopped because of pending uploads')
    }
  } else if (pendingUploads.length > 0) {
    const proceed = await ctrl.confirm(i18n.t('pending_uploads', [pendingUploads.length]))
    if (!proceed) {
      throw new Error('Stopped because of pending uploads')
    }
  }
  return data
}
