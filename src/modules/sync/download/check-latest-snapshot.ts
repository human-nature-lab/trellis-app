import { i18n } from '@/i18n'
import SyncService from '@/services/SyncService'
import { Controller, Step } from '..'

export class CheckLatestSnapshot implements Step<any, { snapshotId: string }> {
  public name = 'Check Latest Snapshot'

  async run (_, ctrl: Controller, log: typeof console) {
    const serverLatestSnapshot = await SyncService.getLatestSnapshot(ctrl.source)
    if (Object.keys(serverLatestSnapshot).length === 0) {
      log.warn(i18n.t('no_snapshot_found'))
    }
    return {
      message: i18n.t('success'),
      data: {
        snapshotId: serverLatestSnapshot.id,
      },
    }
  }
}
