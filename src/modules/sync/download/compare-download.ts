import DatabaseService from '@/services/database'
import { Controller } from '..'
import { i18n } from '@/i18n'
import Snapshot from '@/entities/trellis/Snapshot'

export async function compareDownload (data: { snapshot: Snapshot }, ctrl: Controller) {
  const localDownload = await DatabaseService.getLatestDownload()
  // We haven't downloaded a snapshot yet
  if (!localDownload) {
    return data
  }
  const isOlder = localDownload.createdAt.getTime() > data.snapshot.createdAt.toDate().getTime()
  const isSame = localDownload.createdAt.getTime() === data.snapshot.createdAt.toDate().getTime()
  if (isOlder) {
    const msg = i18n.t('older_snapshot', [data.snapshot.createdAt, localDownload.createdAt])
    const proceed = await ctrl.confirm(msg)
    if (!proceed) {
      throw new Error(msg.toString())
    }
  } else if (isSame) {
    const msg = i18n.t('last_snapshot_date', [data.snapshot.createdAt])
    const proceed = await ctrl.confirm(msg)
    if (!proceed) {
      throw new Error(msg.toString())
    }
  }
  return data
}
