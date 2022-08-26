import PhotoService from '@/services/photo'
import FileService from '@/services/file'
import DeviceService from '@/services/device'
import { StepController } from './controller'
import SyncService from '@/services/SyncService'
import { i18n } from '@/i18n'
import formatBytesFilter from '@/filters/format-bytes.filter'
import { DownloadQueue } from '@/classes/DownloadQueue'
import Photo from '@/entities/trellis/Photo'
import axios from 'axios'

type MinPhoto = Pick<Photo, 'id' | 'fileName'>

export async function missingImages () {
  const [photoList, localList] = await Promise.all([
    PhotoService.getPhotoIdsAndFileNames(),
    FileService.listPhotos(),
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
  const queue = new DownloadQueue<MinPhoto>(async photo => {
    try {
      const res = await SyncService.downloadImage(ctrl.source, photo.fileName)
      const fileSize = +res.headers['content-length']
      await FileService.writeFile('photos', res.data, photo.fileName, fileSize)
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
