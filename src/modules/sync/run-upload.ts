import { FSFileEntry } from '@/cordova/file'
import { insomnia } from '@/cordova/insomnia'
import { i18n } from '@/i18n'
import SyncService from '@/services/SyncService'
import { authenticateDevice, checkConnection, compareTime } from './common'
import { VueController } from './controller'
import { findImages, getServerMissingImages, uploadImages } from './images'
import {
  calculateHash,
  compressUpload,
  createUpload,
  emptyUploadsDirectory,
  registerUpload,
  uploadSnapshot,
  verifyUpload,
} from './upload'
import { getMissingServerAssets, uploadAssets } from './assets'

export function runUpload (ctrl: VueController, onlyImageUpload: boolean) {
  const g1 = ctrl.addGroup(i18n.t('connecting'))

  const g1s1 = ctrl.addStep(g1, i18n.t('checking_connection'))
  const g1s2 = ctrl.addStep(g1, i18n.t('device_authenticating'))
  const g1s3 = ctrl.addStep(g1, i18n.t('comparing_server_time'))

  let g2, g3, g2s1, g2s2, g2s3, g2s4, g3s1, g3s2, g3s3
  if (!onlyImageUpload) {
    g2 = ctrl.addGroup(i18n.t('creating'))
    g3 = ctrl.addGroup(i18n.t('uploading'))
    g2s1 = ctrl.addStep(g2, i18n.t('emptying_uploads'))
    g2s2 = ctrl.addStep(g2, i18n.t('creating_upload'))
    g2s3 = ctrl.addStep(g2, i18n.t('compressing_upload'))
    g2s4 = ctrl.addStep(g2, i18n.t('calculating_hash'))

    g3s1 = ctrl.addStep(g3, i18n.t('uploading'))
    g3s2 = ctrl.addStep(g3, i18n.t('verifying_upload'))
    g3s3 = ctrl.addStep(g3, i18n.t('registering_upload'))
  }

  const g4 = ctrl.addGroup(i18n.t('uploading_images'))
  const g4s01 = ctrl.addStep(g4, i18n.t('analyzing_assets'))
  const g4s02 = ctrl.addStep(g4, i18n.t('uploading_assets'))
  const g4s1 = ctrl.addStep(g4, i18n.t('requesting_image_list'))
  const g4s2 = ctrl.addStep(g4, i18n.t('finding_images'))
  const g4s3 = ctrl.addStep(g4, i18n.t('uploading_images'))

  return function () {
    return insomnia.withScreenOn(async () => {
      ctrl.setGroup(g1)
      ctrl.setStep(g1s1)
      await checkConnection(ctrl)
      ctrl.setStep(g1s2)
      const a = await authenticateDevice(ctrl)
      ctrl.setStep(g1s3)
      await compareTime()

      let uploadData: {
        fileEntry: FSFileEntry
        updatedPhotos: any[]
        updatedAssets: string[]
      }
      if (!onlyImageUpload) {
        const sync = await SyncService.createSync('upload', a.deviceId)
        try {
          ctrl.setGroup(g2)
          ctrl.setStep(g2s1)
          await emptyUploadsDirectory()
          ctrl.setStep(g2s2)
          uploadData = await createUpload(ctrl)
          console.log('uploadData', uploadData)
          ctrl.setStep(g2s3)
          const c = await compressUpload(uploadData)
          ctrl.setStep(g2s4)
          const d = await calculateHash(c)
          if (ctrl.isCancelled) {
            throw new Error(i18n.t('operation_canceled').toString())
          }

          ctrl.setGroup(g3)
          ctrl.setStep(g3s1)
          await uploadSnapshot(ctrl, c)
          ctrl.setStep(g3s2)
          await verifyUpload(Object.assign(c, d))
          ctrl.setStep(g3s3)
          await registerUpload({ sync })
        } catch (err) {
          console.error(err)
          await SyncService.registerCancelledSync(sync)
          if (err.exception) {
            throw err.exception
          }
          throw err
        }
      }

      if (ctrl.isCancelled) {
        throw new Error(i18n.t('operation_canceled').toString())
      }
      ctrl.setGroup(g4)
      ctrl.setStep(g4s01)
      const missingAssetIds = await getMissingServerAssets(ctrl)
      ctrl.setStep(g4s02)
      debugger
      if (uploadData) {
        missingAssetIds.push(...uploadData.updatedAssets)
      }
      await uploadAssets(ctrl, missingAssetIds)

      ctrl.setStep(g4s1)
      const imA = await getServerMissingImages(ctrl)
      ctrl.setStep(g4s2)
      if (uploadData) {
        imA.imageList = imA.imageList.concat(uploadData.updatedPhotos)
      }
      const imB = await findImages(ctrl, imA.imageList)
      ctrl.setStep(g4s3)
      await uploadImages(ctrl, imB)

      ctrl.done()
    })
  }
}
