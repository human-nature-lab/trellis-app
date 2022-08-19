import { Controller } from '..'
import ZipService from '@/services/zip'
import { throttle } from 'lodash'

export async function extractSnapshot (data: { fileEntry: any }, ctrl: Controller) {
  const unzippedFile = await ZipService.unzipFile(data.fileEntry, throttle(progressEvent => {
    ctrl.setProgress(progressEvent.loaded, progressEvent.total)
  }, 1000))
  ctrl.log.info('unzippedFile', unzippedFile)
  return data
}
