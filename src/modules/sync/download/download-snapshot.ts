import SyncService from '@/services/SyncService'
import DeviceService from '@/services/device'
import DatabaseService from '@/services/database'
import FileService from '@/services/file'
import { Controller } from '..'
import { i18n } from '@/i18n'
import { getSyncAuthentication } from '@/services/http/AxiosInstance'
import { throttle } from 'lodash'
import { CancelPromise } from '@/types/CancelPromise'
import Snapshot from '@/entities/trellis/Snapshot'

export async function downloadSnapshot ({ snapshot }: { snapshot: Snapshot }, ctrl: Controller) {
  const fileName = snapshot.id + '.sql.zip'
  const deviceId = await DeviceService.getUUID()
  const apiRoot = await DatabaseService.getServerIPAddress()
  const uri = apiRoot + `/sync/device/${deviceId}/snapshot/${snapshot.id}/download`
  const fileSystem = await FileService.requestFileSystem()
  const directoryEntry = await FileService.getDirectoryEntry(fileSystem, 'snapshots')
  const fileEntry = await FileService.getFileEntry(directoryEntry, fileName)
  const syncAuth = await getSyncAuthentication()
  ctrl.log.info('starting download')
  const p: CancelPromise<void> = FileService.download(uri, fileEntry, throttle((progressEvent) => {
    ctrl.setProgress(progressEvent.loaded, progressEvent.total)
  }, 1000), syncAuth)
  ctrl.onCancel.add(p.cancel)
  await p
  ctrl.log.info('download complete')
  return {
    snapshot,
    fileEntry,
  }
}
