import uuid from 'uuid/v4'
import path from 'path'
import { file, FSFileEntry } from '@/cordova/file'
import SyncService from '@/services/SyncService'
import ZipService from '@/services/zip'
import FileService from '@/services/file'
import DeviceService from '@/services/device'
import DatabaseService from '@/services/database'
import { VueController } from './controller'
import { getSyncAuthentication } from '@/services/http/AxiosInstance'
import { filetransfer } from '@/cordova/filetransfer'
import Sync from '@/entities/trellis-config/Sync'

export async function emptyUploadsDirectory () {
  const fs = await file.persistent()
  return fs.emptyDirectory('upload_temp', false, { create: true })
}

export async function createUpload (ctrl: VueController) {
  const syncId = uuid()
  const fileName = syncId + '.json'
  const fs = await file.persistent()
  const directoryEntry = await fs.root.getDirectory('upload_temp', { create: true })
  let fileEntry = await directoryEntry.getFile(fileName, { create: true })
  console.log('creating upload file')
  const { updatedPhotos, updatedAssets } = await SyncService.createUploadFile(fileEntry, p => {
    ctrl.setProgress(p.created, p.total)
  }, () => ctrl.isCancelled)
  fileEntry = await directoryEntry.getFile(fileName)
  return {
    fileEntry,
    updatedPhotos,
    updatedAssets,
  }
}

export async function compressUpload (data: { fileEntry: FSFileEntry }) {
  const fs = await file.persistent()
  const toDir = await fs.root.getDirectory('uploads', { create: true })
  const zipName = data.fileEntry.name + '.zip'
  const fromPath = await fs.resolve('upload_temp')
  const toPath = path.join(toDir.nativeURL, zipName)
  console.log('upload file', await data.fileEntry.text())
  console.log('zipping', fromPath, toPath, toDir.toInternalURL())
  await ZipService.zip(fromPath, toPath)
  return {
    compressedFileEntry: await toDir.getFile(zipName),
  }
}

export async function calculateHash (data: { compressedFileEntry: FSFileEntry }) {
  const hash = await FileService.calculateMD5Hash(data.compressedFileEntry)
  return { hash }
}

export async function uploadSnapshot (ctrl: VueController, data: { compressedFileEntry: FSFileEntry }) {
  const [deviceId, deviceKey, apiRoot, syncAuth] = await Promise.all([
    DeviceService.getUUID(),
    DeviceService.getDeviceKey(),
    DatabaseService.getServerIPAddress(),
    getSyncAuthentication(),
  ])
  const uri = apiRoot + `/sync/device/${deviceId}/upload`
  const res = await filetransfer.upload(uri, data.compressedFileEntry.nativeURL, {
    params: {
      fileName: data.compressedFileEntry.name,
    },
    headers: {
      'X-Key': deviceKey,
      Authorization: syncAuth,
    },
  }, p => {
    ctrl.setProgress(p.loaded, p.total)
  })
  console.log('upload result', res)
}

export function verifyUpload (data: { compressedFileEntry: FSFileEntry, hash: string }) {
  return SyncService.verifyUpload(data.compressedFileEntry, data.hash)
}

export async function registerUpload (data: { sync: Sync }) {
  await SyncService.registerSuccessfulSync(data.sync)
  await SyncService.markUpdatedRowsAsUploaded()
}
