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
import { FSFileEntry, file } from '@/cordova/file'
import { TaskExecution } from './task'
import axios from 'axios'
import { confirm } from '@/components/confirm'

export async function checkDownloadSize (data: { snapshot: Snapshot }, ctrl: TaskExecution) {
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

export async function checkLatestSnapshot (_, ctrl: TaskExecution) {
  const source = axios.CancelToken.source()
  ctrl.onCancel(() => source.cancel())
  const serverLatestSnapshot = await SyncService.getLatestSnapshot(source)
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

export async function compareDownload (data: { snapshot: Snapshot }) {
  const localDownload = await DatabaseService.getLatestDownload()
  // We haven't downloaded a snapshot yet
  if (!localDownload) {
    return data
  }
  const isOlder = localDownload.createdAt.getTime() > data.snapshot.createdAt.getTime()
  const isSame = localDownload.createdAt.getTime() === data.snapshot.createdAt.getTime()
  if (isOlder) {
    const msg = i18n.t('older_snapshot', [data.snapshot.createdAt, localDownload.createdAt])
    const proceed = await confirm(msg)
    if (!proceed) {
      throw new Error(msg.toString())
    }
  } else if (isSame) {
    const msg = i18n.t('last_snapshot_date', [data.snapshot.createdAt])
    const proceed = await confirm(msg)
    if (!proceed) {
      throw new Error(msg.toString())
    }
  }
  return data
}

export async function compareUpload (data: { snapshot: Snapshot }, ctrl: TaskExecution) {
  const deviceId = await DeviceService.getUUID()
  const source = axios.CancelToken.source()
  ctrl.onCancel(() => source.cancel())
  const pendingUploads = await SyncService.getPendingUploads(source)
  let pendingFromThisDevice = 0
  for (let i = 0; i < pendingUploads.length; i++) {
    if (pendingUploads[i].device_id === deviceId) {
      pendingFromThisDevice++
    }
  }

  if (pendingFromThisDevice > 0) {
    const proceed = await confirm(i18n.t('pending_uploads_device', [pendingFromThisDevice]))
    if (!proceed) {
      throw new Error('Stopped because of pending uploads')
    }
  } else if (pendingUploads.length > 0) {
    const proceed = await confirm(i18n.t('pending_uploads', [pendingUploads.length]))
    if (!proceed) {
      throw new Error('Stopped because of pending uploads')
    }
  }
  return data
}

export async function configureDatabase (_, ctrl: TaskExecution) {
  const status = { message: i18n.t('configuring_db') as string }
  ctrl.progress.total = 2
  await DatabaseService.createDatabase()
  const queryRunner = (await DatabaseService.getDatabase()).createQueryRunner()
  await DatabaseService.createUpdatedRecordsTable(queryRunner, status)
  ctrl.progress.current = 1
  await DatabaseService.addTriggers(queryRunner, status)
  ctrl.progress.current = 2
  return delay(500)
}

export async function downloadSnapshot ({ snapshot }: { snapshot: Snapshot }, ctrl: TaskExecution) {
  ctrl.progress.total = 1
  const fileName = snapshot.id + '.sql.zip'
  const [deviceId, deviceKey, apiRoot, syncAuth] = await Promise.all([
    DeviceService.getUUID(),
    DeviceService.getDeviceKey(),
    DatabaseService.getServerIPAddress(),
    getSyncAuthentication(),
  ])
  const uri = apiRoot + `/sync/device/${deviceId}/snapshot/${snapshot.id}/download`
  const directoryEntry = await file.applicationStorageDirectory('snapshots', { create: true })
  // const directoryEntry = await FileService.getDirectoryEntry(fs, 'snapshots')
  const fileEntry = await directoryEntry.getFile(fileName, { create: true })
  const url = new URL(uri)
  // if (DEV && url.protocol === 'https:') {
  //   url.protocol = 'http:'
  //   url.port = '9000'
  //   ctrl.log.warn('downloading over http in dev mode', url.href)
  // }
  const snapshotFilePath = path.join(directoryEntry.toURL(), fileName)
  console.log('snapshotFilePath', snapshotFilePath, fileEntry.toURL())
  const p = filetransfer.download(url.toString(), snapshotFilePath, DEV, {
    headers: {
      'X-Key': deviceKey,
      Authorization: syncAuth,
    },
  }, throttle((progressEvent) => {
    ctrl.progress.total = progressEvent.total
    ctrl.progress.current = progressEvent.loaded
  }, 250))
  // const p: CancelPromise<void> = FileService.download(uri, fileEntry, throttle((progressEvent) => {
  //   ctrl.setProgress(progressEvent.loaded, progressEvent.total)
  // }, 1000), syncAuth)
  ctrl.onCancel(p.cancel)
  await p
  ctrl.log.info('download complete')
  return {
    snapshot,
    fileEntry,
  }
}

export async function emptySnapshotDirectory () {
  const fileSystem = await FileService.requestFileSystem()
  const tempFs = await file.temporary()
  const appDir = await file.applicationStorageDirectory()
  console.log(fileSystem.root.fullPath, tempFs.root.fullPath, appDir.fullPath)
  const rootEntries = await appDir.readEntries()
  console.log('rootEntries', rootEntries.map(e => e.name))
  const snapshotsDir = await appDir.getDirectory('snapshots', { create: true })
  const existingSnapshots = await snapshotsDir.readEntries()
  console.log('existingSnapshots', existingSnapshots.map(e => e.name))
  await snapshotsDir.empty(true)
}

export async function extractSnapshot (data: { fileEntry: any }, ctrl: TaskExecution) {
  const unzippedFile = await ZipService.unzipFile(data.fileEntry, throttle(progressEvent => {
    ctrl.progress.total = progressEvent.total
    ctrl.progress.current = progressEvent.loaded
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
  sync.snapshotCreatedAt = snapshot.createdAt
  await SyncService.registerSuccessfulSync(sync)
}

export async function removeDatabase () {
  const dbLoc = cordova.file.applicationStorageDirectory + 'databases/trellis'
  if (await FileService.existsUrl(dbLoc)) {
    await FileService.deleteUrl(dbLoc)
  }
}

export async function verifyDownload (data: { fileEntry: FSFileEntry, snapshot: Snapshot }, ctrl: TaskExecution) {
  const md5Hash = await FileService.calculateMD5Hash(data.fileEntry)
  if (md5Hash !== data.snapshot.hash) {
    ctrl.log.error('hashes dont match', data.snapshot.hash, md5Hash)
    throw new Error(i18n.t('hash_dont_match').toString())
  }
  return data
}
