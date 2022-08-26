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
import { delay } from '@/classes/delay'

export function runDownload (ctrl: VueController): () => Promise<void> {
  const g1 = ctrl.addGroup(i18n.t('connecting'))
  const g2 = ctrl.addGroup(i18n.t('downloading'))
  const g3 = ctrl.addGroup(i18n.t('replacing'))

  const g1s1 = ctrl.addStep(g1, i18n.t('checking_connection'))
  const g1s2 = ctrl.addStep(g1, i18n.t('device_authenticating'))
  const g1s3 = ctrl.addStep(g1, i18n.t('comparing_server_time'))
  const g1s4 = ctrl.addStep(g1, i18n.t('checking_snapshot'))
  const g1s5 = ctrl.addStep(g1, i18n.t('comparing_snapshot_download'))
  const g1s6 = ctrl.addStep(g1, i18n.t('comparing_snapshot_upload'))

  const g2s1 = ctrl.addStep(g2, i18n.t('emptying_snapshots'))
  const g2s2 = ctrl.addStep(g2, i18n.t('checking_space'))
  const g2s3 = ctrl.addStep(g2, i18n.t('downloading_snapshot'))
  const g2s4 = ctrl.addStep(g2, i18n.t('verifying_download'))
  const g2s5 = ctrl.addStep(g2, i18n.t('extracting_snapshot'))

  const g3s1 = ctrl.addStep(g3, i18n.t('closing_db'))
  const g3s2 = ctrl.addStep(g3, i18n.t('removing_db'))
  const g3s3 = ctrl.addStep(g3, i18n.t('moving_db'))
  const g3s4 = ctrl.addStep(g3, i18n.t('configuring_db'))
  const g3s5 = ctrl.addStep(g3, i18n.t('registering_download'))

  return async function () {
    ctrl.setGroup(g1)
    ctrl.setStep(g1s1)
    await checkConnection(ctrl)
    ctrl.setStep(g1s2)
    const a = await authenticateDevice(ctrl)
    ctrl.setStep(g1s3)
    // await compareTime()
    ctrl.setStep(g1s4)
    const b = await checkLatestSnapshot(ctrl)
    ctrl.setStep(g1s5)
    const c = await compareDownload(ctrl, b)
    ctrl.setStep(g1s6)
    const d = await compareUpload(ctrl, c)

    if (ctrl.isCancelled) {
      throw new Error(i18n.t('operation_canceled').toString())
    }
    ctrl.setGroup(g2)
    const sync = await SyncService.createSync('download', a.deviceId)
    try {
      await insomnia.keepAwake()
      ctrl.setStep(g2s1)
      await emptySnapshotDirectory()
      ctrl.setStep(g2s2)
      await checkDownloadSize(ctrl, d)
      ctrl.setStep(g2s3)
      const e = await downloadSnapshot(ctrl, d)
      ctrl.setStep(g2s4)
      await verifyDownload(ctrl, e)
      ctrl.setStep(g2s5)
      await extractSnapshot(ctrl, e)
      if (ctrl.isCancelled) {
        throw new Error(i18n.t('operation_canceled').toString())
      }

      ctrl.setGroup(g3)
      ctrl.setStep(g3s1)
      await closeDatabase()
      ctrl.setStep(g3s2)
      await removeDatabase()
      ctrl.setStep(g3s3)
      await moveDatabase()
      ctrl.setStep(g3s4)
      await configureDatabase(ctrl)
      ctrl.setStep(g3s5)
      await registerDownload({ sync, snapshot: e.snapshot })
      await insomnia.allowSleep()
      ctrl.done()
    } catch (err) {
      console.log('cancelled sync')
      console.error(err)
      await insomnia.allowSleep()
      await SyncService.registerCancelledSync(sync)
      throw err
    }
  }
}
