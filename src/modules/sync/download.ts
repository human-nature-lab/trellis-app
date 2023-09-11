import { throttle } from 'lodash'
import path from 'path'
import formatBytesFilter from '@/filters/format-bytes.filter'
import { i18n } from '@/i18n'
import DeviceService from '@/services/device'
import SyncService from '@/services/SyncService'
import DatabaseService from '@/services/database'
import { StepController } from './controller'
import Snapshot from '@/entities/trellis/Snapshot'
import FileService from '@/services/file'
import { getSyncAuthentication } from '@/services/http/AxiosInstance'
import { delay } from '@/classes/delay'
import ZipService from '@/services/zip'
import Sync from '@/entities/trellis-config/Sync'
import { filetransfer } from '@/cordova/filetransfer'

export async function checkDownloadSize (ctrl: StepController, data: { snapshot: Snapshot }) {
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

export async function checkLatestSnapshot (ctrl: StepController) {
  const serverLatestSnapshot = await SyncService.getLatestSnapshot(ctrl.source)
  if (Object.keys(serverLatestSnapshot).length === 0) {
    ctrl.log.warn(i18n.t('no_snapshot_found'))
  }
  return {
    snapshot: serverLatestSnapshot,
  }
}

export async function closeDatabase () {
  await DatabaseService.closeDatabase()
}

export async function compareDownload (ctrl: StepController, data: { snapshot: Snapshot }) {
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

export async function compareUpload (ctrl: StepController, data: { snapshot: Snapshot }) {
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

export async function configureDatabase (ctrl: StepController) {
  const status = { message: i18n.t('configuring_db') }
  ctrl.setProgress(0, 2)
  await DatabaseService.createDatabase()
  const queryRunner = (await DatabaseService.getDatabase()).createQueryRunner()
  await DatabaseService.createUpdatedRecordsTable(queryRunner, status)
  ctrl.setProgress(1, 2)
  await DatabaseService.addTriggers(queryRunner, status)
  ctrl.setProgress(2, 2)
  return delay(500)
}

export async function downloadSnapshot (ctrl: StepController, { snapshot }: { snapshot: Snapshot }) {
  ctrl.setProgress(0, 1)
  const fileName = snapshot.id + '.sql.zip'
  const [deviceId, deviceKey, apiRoot, fileSystem, syncAuth] = await Promise.all([
    DeviceService.getUUID(),
    DeviceService.getDeviceKey(),
    DatabaseService.getServerIPAddress(),
    FileService.requestFileSystem(),
    getSyncAuthentication(),
  ])
  const uri = apiRoot + `/sync/device/${deviceId}/snapshot/${snapshot.id}/download`
  const directoryEntry = await FileService.getDirectoryEntry(fileSystem, 'snapshots')
  const fileEntry = await FileService.getFileEntry(directoryEntry, fileName)
  ctrl.log.info('starting download')
  const p = filetransfer.download(uri, path.join(directoryEntry.toURL(), fileName), false, {
    headers: {
      'X-Key': deviceKey,
      Authorization: syncAuth,
    },
  }, throttle((progressEvent) => {
    ctrl.setProgress(progressEvent.loaded, progressEvent.total)
  }, 1000))
  // const p: CancelPromise<void> = FileService.download(uri, fileEntry, throttle((progressEvent) => {
  //   ctrl.setProgress(progressEvent.loaded, progressEvent.total)
  // }, 1000), syncAuth)
  ctrl.onCancel.add(p.cancel)
  await p
  ctrl.log.info('download complete')
  return {
    snapshot,
    fileEntry,
  }
}

export async function emptySnapshotDirectory () {
  const fileSystem = await FileService.requestFileSystem()
  const directoryEntry = await FileService.getDirectoryEntry(fileSystem, 'snapshots')
  await FileService.emptyDirectory(directoryEntry)
}

export async function extractSnapshot (ctrl: StepController, data: { fileEntry: any }) {
  const unzippedFile = await ZipService.unzipFile(data.fileEntry, throttle(progressEvent => {
    ctrl.setProgress(progressEvent.loaded, progressEvent.total)
  }, 1000))
  ctrl.log.info('unzippedFile', unzippedFile)
  return data
}

export async function moveDatabase () {
  const dbUrl = cordova.file.applicationStorageDirectory + 'databases/trellis'
  const snapshotUrl = cordova.file.applicationStorageDirectory + 'files/files/snapshots/snapshot.db'
  console.log('moveDatabase', dbUrl, snapshotUrl)
  await FileService.moveUrl(snapshotUrl, dbUrl)
}

export async function registerDownload ({ sync, snapshot }: { sync: Sync, snapshot: Snapshot }) {
  sync.snapshotCreatedAt = snapshot.createdAt.toDate()
  await SyncService.registerSuccessfulSync(sync)
}

export async function removeDatabase () {
  const dbLoc = cordova.file.applicationStorageDirectory + 'databases/trellis'
  if (await FileService.existsUrl(dbLoc)) {
    await FileService.deleteUrl(dbLoc)
  }
}

export async function verifyDownload (ctrl: StepController, data: { fileEntry: FileEntry, snapshot: Snapshot }) {
  const md5Hash = await FileService.calculateMD5Hash(data.fileEntry)
  if (md5Hash !== data.snapshot.hash) {
    ctrl.log.error('hashes dont match', data.snapshot.hash, md5Hash)
    throw new Error(i18n.t('hash_dont_match').toString())
  }
  return data
}
