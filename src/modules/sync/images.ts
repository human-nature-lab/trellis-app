import PhotoService from '@/services/photo'
import FileService from '@/services/file'
import DeviceService from '@/services/device'
import DatabaseService from '@/services/database'
import { StepController } from './controller'
import SyncService from '@/services/SyncService'
import { i18n } from '@/i18n'
import formatBytesFilter from '@/filters/format-bytes.filter'
import { AsyncQueue } from '@/classes/AsyncQueue'
import Photo from '@/entities/trellis/Photo'
import axios from 'axios'
import { file, FSFileEntry } from '@/cordova/file'
import { delay } from '@/classes/delay'
import { getSyncAuthentication } from '@/services/http/AxiosInstance'
import { filetransfer } from '@/cordova/filetransfer'
import { throttle } from 'lodash'

type MinPhoto = Pick<Photo, 'id' | 'fileName'>

export async function getLocalMissingImages (ctrl: StepController) {
  let p = 0
  ctrl.setProgress(0, 3)
  const [photoList, localList] = await Promise.all([
    PhotoService.getPhotoIdsAndFileNames().then(res => {
      p++
      ctrl.setProgress(p, 3)
      return res
    }),
    FileService.listPhotos().then(res => {
      p++
      ctrl.setProgress(p, 3)
      return res
    }),
  ])
  const imageList: Record<string, MinPhoto> = {}
  for (let i = 0; i < photoList.length; i++) {
    const photo = photoList[i]
    imageList[photo.fileName] = photo
  }
  for (let j = 0; j < localList.length; j++) {
    const fileName = localList[j].name
    if (fileName in imageList) {
      delete imageList[fileName]
    }
  }
  ctrl.setProgress(3, 3)
  await delay(500)
  return Object.values(imageList)
}

export async function checkDiskSpace (ctrl: StepController, photos: MinPhoto[]) {
  const [freeDiskSpace, serverList] = await Promise.all([
    DeviceService.getFreeDiskSpace(),
    SyncService.getImageFileList(ctrl.source, photos.map(p => p.fileName)),
  ])
  const totalImageSize = serverList.total_size
  const photosRequested = serverList.photos_requested
  const photosFound = serverList.photos_found
  if (photosFound < photosRequested) {
    ctrl.setMessage(i18n.t('requested_images_found_images', [photosRequested, photosFound]), 'warning')
  }
  if (totalImageSize > freeDiskSpace) {
    ctrl.setMessage(
      i18n.t('images_require_space', [formatBytesFilter(totalImageSize), formatBytesFilter(freeDiskSpace)]),
      'warning',
    )
  }
}

export async function downloadImages (ctrl: StepController, photos: MinPhoto[]) {
  const failedImages: {err: Error, photo: MinPhoto}[] = []
  const fs = await file.requestFileSystem(LocalFileSystem.PERSISTENT)
  const photosDir = await fs.root.getDirectory('photos', { create: true })
  const queue = new AsyncQueue<MinPhoto>(async photo => {
    try {
      await SyncService.downloadImageTo(photo.fileName, photosDir)
      ctrl.setProgress(queue.total - queue.pending.length, queue.total, true)
    } catch (err) {
      failedImages.push({ err, photo })
    }
  })
  queue.add(...photos)
  ctrl.onCancel.add(queue.cancel)
  await queue.run()
  if (failedImages.length) {
    ctrl.log.warn('unable to download images', failedImages)
    ctrl.setMessage(i18n.t('server_cant_find_images', [failedImages.length]))
    const lastErr = failedImages[failedImages.length - 1].err
    if (lastErr instanceof axios.Cancel) {
      throw lastErr
    }
  }
}

export async function downloadImagesOld (ctrl: StepController, photos: MinPhoto[]) {
  const failedImages: {err: Error, photo: MinPhoto}[] = []
  const queue = new AsyncQueue<MinPhoto>(async photo => {
    try {
      const res = await SyncService.downloadImage(ctrl.source, photo.fileName)
      const fileSize = +res.headers['content-length']
      await FileService.writeFile('photos', res.data, photo.fileName, fileSize)
      ctrl.setProgress(queue.total - queue.pending.length, queue.total, true)
    } catch (err) {
      failedImages.push({ err, photo })
    }
  }, 16)
  queue.add(...photos)
  ctrl.onCancel.add(queue.cancel)
  await queue.run()
  if (failedImages.length) {
    ctrl.log.warn('unable to download images', failedImages)
    ctrl.setMessage(i18n.t('server_cant_find_images', [failedImages.length]))
    const lastErr = failedImages[failedImages.length - 1].err
    if (lastErr instanceof axios.Cancel) {
      throw lastErr
    }
  }
}

export async function getServerMissingImages (ctrl: StepController) {
  const imageList = await SyncService.getMissingPhotos(ctrl.source)
  return { imageList }
}

export async function findImages (ctrl: StepController, imageFiles: string[]) {
  const fileList: FSFileEntry[] = []
  const fs = await file.persistent()
  const photoDir = await fs.root.getDirectory('photos')
  if (imageFiles.length < 1000) {
    // Just query if each file exists on disk
    ctrl.setProgress(0, imageFiles.length)
    for (let i = 0; i < imageFiles.length && !ctrl.isCancelled; i++) {
      const fileName = imageFiles[i]
      try {
        fileList.push(await photoDir.getFile(fileName))
      } catch (err) {
        // code = 1 means the file doesn't exist
        if (err.code !== 1) {
          throw err
        }
      }
      ctrl.setProgress(i, imageFiles.length, true)
    }
  } else {
    // get the full list of photos and compare in memory
    const existing = await photoDir.readEntries()
    const m = new Map<string, FSFileEntry>()
    for (const f of existing) {
      if (f.isFile) {
        m.set(f.name, f)
      }
    }
    for (const f of imageFiles) {
      if (m.has(f)) {
        fileList.push(m.get(f))
      }
    }
  }
  if (fileList.length === 0) {
    ctrl.setMessage(i18n.t('no_photos'), 'success')
    await delay(1000)
  }
  return fileList
}

export async function uploadImages (ctrl: StepController, images: FSFileEntry[]) {
  const [deviceId, deviceKey, apiRoot, syncAuth] = await Promise.all([
    DeviceService.getUUID(),
    DeviceService.getDeviceKey(),
    DatabaseService.getServerIPAddress(),
    getSyncAuthentication(),
  ])
  const uri = apiRoot + `/sync/device/${deviceId}/upload/image`
  const failedImages: {err: Error, image: string }[] = []
  const setProgress = throttle(ctrl.setProgress, 1000)
  const queue = new AsyncQueue<FSFileEntry>(async entry => {
    try {
      const res = await filetransfer.upload(uri, entry.nativeURL, {
        params: {
          fileName: entry.name,
        },
        headers: {
          'X-Key': deviceKey,
          Authorization: syncAuth,
        },
      })
      setProgress(queue.total - queue.pending.length, queue.total, true)
      console.log('res', res)
    } catch (err) {
      failedImages.push({ err, image: entry.name })
    }
  }, 2)
  ctrl.onCancel.add(() => queue.cancel())
  queue.add(...images)
  await queue.run()
  if (failedImages.length) {
    ctrl.log.warn('unable to upload images', failedImages)
    ctrl.setMessage(i18n.t('server_rejected_images', [failedImages.length]))
    const lastErr = failedImages[failedImages.length - 1].err
    if (lastErr instanceof axios.Cancel) {
      throw lastErr
    }
  }
  return queue.run()
}
