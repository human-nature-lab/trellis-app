import formatBytesFilter from '@/filters/format-bytes.filter'
import { i18n } from '@/i18n'
import { Controller } from '../'
import SyncService from '@/services/SyncService'
import DeviceService from '@/services/device'
import Snapshot from '@/entities/trellis/Snapshot'

export async function checkDownloadSize (data: { snapshot: Snapshot }, ctrl: Controller) {
  console.log(data)
  const [freeDiskSpace, snapshotFileSize] = await Promise.all([
    DeviceService.getFreeDiskSpace(),
    SyncService.getSnapshotFileSize(ctrl.source, data.snapshot.id),
  ])
  if (snapshotFileSize > freeDiskSpace) {
    ctrl.log.warn(i18n.t('snapshot_requires_space', [
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
  return data
}
