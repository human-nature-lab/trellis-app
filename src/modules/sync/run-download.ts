import { checkConnection, authenticateDevice, compareTime } from './common'
import {
  checkLatestSnapshot,
  compareDownload,
  compareUpload,
  emptySnapshotDirectory,
  checkDownloadSize,
  downloadSnapshot,
  verifyDownload,
  extractSnapshot,
  closeDatabase,
  removeDatabase,
  moveDatabase,
  configureDatabase,
  registerDownload,
} from './download'
import { VueController } from './controller'
import { i18n } from '@/i18n'
import SyncService from '@/services/SyncService'
import { insomnia } from '@/cordova/insomnia'
import { getLocalMissingImages, checkDiskSpace, downloadImages } from './images'
import { delay } from '@/classes/delay'
import { analyzeAssets, downloadAssets } from './assets'

export function runDownload (ctrl: VueController, onlyPhotos = false) {
  const g1 = ctrl.addGroup(i18n.t('connecting'))
  let g2, g3
  if (!onlyPhotos) {
    g2 = ctrl.addGroup(i18n.t('downloading'))
    g3 = ctrl.addGroup(i18n.t('replacing'))
  }
  const g4 = ctrl.addGroup(i18n.t('downloading_images'))

  const g1s1 = ctrl.addStep(g1, i18n.t('checking_connection'))
  const g1s2 = ctrl.addStep(g1, i18n.t('device_authenticating'))
  const g1s3 = ctrl.addStep(g1, i18n.t('comparing_server_time'))

  let g2s1, g2s2, g2s3, g2s4, g2s5, g2s6, g2s7, g3s1, g3s2, g3s3, g3s4, g3s5, g3s6
  if (!onlyPhotos) {
    g2s1 = ctrl.addStep(g2, i18n.t('checking_snapshot'))
    g2s2 = ctrl.addStep(g2, i18n.t('comparing_snapshot_download'))
    g2s3 = ctrl.addStep(g2, i18n.t('comparing_snapshot_upload'))
    g2s4 = ctrl.addStep(g2, i18n.t('emptying_snapshots'))
    g2s5 = ctrl.addStep(g2, i18n.t('checking_space'))
    g2s6 = ctrl.addStep(g2, i18n.t('downloading_snapshot'))
    g2s7 = ctrl.addStep(g2, i18n.t('verifying_download'))

    g3s1 = ctrl.addStep(g3, i18n.t('extracting_snapshot'))
    g3s2 = ctrl.addStep(g3, i18n.t('closing_db'))
    g3s3 = ctrl.addStep(g3, i18n.t('removing_db'))
    g3s4 = ctrl.addStep(g3, i18n.t('moving_db'))
    g3s5 = ctrl.addStep(g3, i18n.t('configuring_db'))
    g3s6 = ctrl.addStep(g3, i18n.t('registering_download'))
  }

  const g4s01 = ctrl.addStep(g4, i18n.t('analyzing_assets'))
  const g4s02 = ctrl.addStep(g4, i18n.t('downloading_assets'))
  const g4s1 = ctrl.addStep(g4, i18n.t('requesting_image_list'))
  const g4s2 = ctrl.addStep(g4, i18n.t('checking_space'))
  const g4s3 = ctrl.addStep(g4, i18n.t('downloading_images'))

  return function () {
    return insomnia.withScreenOn(async () => {
      ctrl.setGroup(g1)
      ctrl.setStep(g1s1)
      await checkConnection(ctrl)
      ctrl.setStep(g1s2)
      const a = await authenticateDevice(ctrl)
      ctrl.setStep(g1s3)
      await compareTime()

      if (!onlyPhotos) {
        const sync = await SyncService.createSync('download', a.deviceId)
        try {
          ctrl.setGroup(g2)
          ctrl.setStep(g2s1)
          const b = await checkLatestSnapshot(ctrl)
          ctrl.setStep(g2s2)
          const c = await compareDownload(ctrl, b)
          ctrl.setStep(g2s3)
          const d = await compareUpload(ctrl, c)
          ctrl.setStep(g2s4)
          await emptySnapshotDirectory()
          ctrl.setStep(g2s5)
          await checkDownloadSize(ctrl, d)
          ctrl.setStep(g2s6)
          const e = await downloadSnapshot(ctrl, d)
          ctrl.setStep(g2s7)
          await verifyDownload(ctrl, e)

          if (ctrl.isCancelled) {
            throw new Error(i18n.t('operation_canceled').toString())
          }

          ctrl.setGroup(g3)
          ctrl.setStep(g3s1)
          const { snapshotEntry } = await extractSnapshot(ctrl, e)
          ctrl.setStep(g3s2)
          await closeDatabase()
          ctrl.setStep(g3s3)
          await removeDatabase()
          ctrl.setStep(g3s4)
          await moveDatabase(ctrl, { snapshotEntry })
          ctrl.setStep(g3s5)
          await configureDatabase(ctrl)
          ctrl.setStep(g3s6)
          await registerDownload({ sync, snapshot: e.snapshot })
          await delay(1000)
        } catch (err) {
          console.log('cancelled sync')
          console.error(err)
          await SyncService.registerCancelledSync(sync)
          if (err.exception) {
            throw err.exception
          }
          throw err
        }
      }

      ctrl.setGroup(g4)
      ctrl.setStep(g4s01)
      const assets = await analyzeAssets(ctrl)
      ctrl.setStep(g4s02)
      await downloadAssets(ctrl, assets)
      ctrl.setStep(g4s1)
      const images = await getLocalMissingImages(ctrl)
      ctrl.setStep(g4s2)
      await checkDiskSpace(ctrl, images)
      ctrl.setStep(g4s3)
      await downloadImages(ctrl, images)
      ctrl.done()
    })
  }
}
