import { i18n } from '@/i18n'
import {
  checkDownloadSize,
  checkLatestSnapshot,
  closeDatabase,
  compareDownload,
  compareUpload,
  configureDatabase,
  downloadSnapshot,
  emptySnapshotDirectory,
  extractSnapshot,
  moveDatabase,
  registerDownload,
  removeDatabase,
  verifyDownload,
} from './download'
import { Task } from './task'
import { authenticateDevice, checkConnection, compareTime } from './common'

export const checkServer = new Task(i18n.t('checking_connection'), checkConnection)
  .add(i18n.t('device_authenticating'), authenticateDevice)
  .add(i18n.t('comparing_server_time'), compareTime)

export const fetchSnapshot = new Task(i18n.t('checking_snapshot'), checkLatestSnapshot)
  .add(i18n.t('comparing_snapshot_download'), compareDownload)
  .add(i18n.t('compare_snapshot_upload'), compareUpload)
  .add(i18n.t('emptying_snapshots'), async data => {
    await emptySnapshotDirectory()
    return data
  })
  .add(i18n.t('checking_space'), checkDownloadSize)
  .add(i18n.t('downloading_snapshot'), downloadSnapshot)
  .add(i18n.t('verifying_download'), verifyDownload)

export const unravelSnapshot = new Task(i18n.t('extracting_snapshot'), extractSnapshot)
  .addMerge(i18n.t('closing_db'), closeDatabase)
  .addMerge(i18n.t('removing_db'), removeDatabase)
  .addMerge(i18n.t('moving_db'), moveDatabase)
  .addMerge(i18n.t('configuring_db'), configureDatabase)
  .add(i18n.t('registering_download'), registerDownload)
