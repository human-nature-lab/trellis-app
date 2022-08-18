import formatBytesFilter from '@/filters/format-bytes.filter'
import { i18n } from '@/i18n'
import { Step, Controller } from '../'
import SyncService from '@/services/SyncService'
import DeviceService from '@/services/device'
import axios from 'axios'

type input = { snapshotId: string }

export class CheckDownloadSize implements Step<input, void> {
  public name = 'Check Download Size'

  async run (data: input, ctrl: Controller, log: typeof console) {
    const source = axios.CancelToken.source()
    const [freeDiskSpace, snapshotFileSize] = await Promise.all([
      DeviceService.getFreeDiskSpace(),
      SyncService.getSnapshotFileSize(source, data.snapshotId),
    ])
    if (snapshotFileSize > freeDiskSpace) {
      log.warn(i18n.t('snapshot_requires_space', [
        formatBytesFilter(snapshotFileSize),
        formatBytesFilter(freeDiskSpace),
      ]))
    } else if ((snapshotFileSize * 5) > freeDiskSpace) {
      const proceed = await ctrl.confirm(i18n.t('extracted_snapshot_requires_space', [
        formatBytesFilter(snapshotFileSize * 5),
        formatBytesFilter(freeDiskSpace),
      ]), 'warn')
      if (!proceed) {
        throw new Error('not enough space on device')
      }
    }
    return {
      message: i18n.t('success'),
    }
  }
}
