import { i18n } from '@/i18n'
import SyncService from '@/services/SyncService'
import { Controller } from '..'

export async function checkLatestSnapshot (_: any, ctrl: Controller) {
  const serverLatestSnapshot = await SyncService.getLatestSnapshot(ctrl.source)
  if (Object.keys(serverLatestSnapshot).length === 0) {
    ctrl.warn(i18n.t('no_snapshot_found'))
  }
  return {
    snapshot: serverLatestSnapshot,
  }
}
