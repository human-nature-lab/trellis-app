import Asset from '@/entities/trellis/Asset'
import { StepController } from './controller'
import { delay } from '@/classes/delay'
import DatabaseService from '@/services/database'
import { file } from '@/cordova/file'
import { AsyncQueue } from '@/classes/AsyncQueue'
import SyncService from '@/services/SyncService'
import { i18n } from '@/i18n'
import axios from 'axios'
import HashService from '@/services/hash'
import { roundDecimals } from '@/classes/M'
import { debounce } from 'lodash'

export async function analyzeAssets (ctrl: StepController): Promise<Asset[]> {
  ctrl.setProgress(0, 3)
  // Check for all assets that are referenced in survey data
  const db = await DatabaseService.getDatabase()
  const q = db.createQueryBuilder(Asset, 'asset')
  q.where(`asset.id in (
    select asset_id from datum where asset_id is not null and deleted_at is null
    and datum.question_datum_id in (
      select id from question_datum where survey_id in (
        select id from survey where deleted_at is null and completed_at is null
      ) and deleted_at is null
    )
  )`)
  const assets = await q.getMany()
  // Compare that list to the list of assets that are already downloaded
  ctrl.setProgress(1, 3)
  const assetDir = await file.dataDirectory('assets', { create: true })
  const assetFiles = await assetDir.files()
  ctrl.setProgress(2, 3)
  await delay(100)
  const missingIds = new Set(assets.map(a => a.id))
  for (const file of assetFiles) {
    missingIds.delete(file.name)
  }
  ctrl.setProgress(3, 3)
  await delay(500)
  const results = assets.filter(a => missingIds.has(a.id))
  // Return a list of assets that need to be downloaded
  return results
}

export async function downloadAssets (ctrl: StepController, assets: Asset[]) {
  const failed: {err: Error, asset: Asset}[] = []
  const assetsDir = await file.dataDirectory('assets', { create: true })
  const queue = new AsyncQueue<Asset>(async asset => {
    try {
      const entry = await SyncService.downloadAssetTo(asset.id, assetsDir)
      const md5 = await HashService.md5Entry(entry)
      if (md5 !== asset.md5Hash) {
        throw new Error('md5 mismatch')
      }
      ctrl.setProgress(queue.total - queue.pending.length, queue.total, true)
    } catch (err) {
      failed.push({ err, asset })
    }
  })
  queue.add(...assets)
  ctrl.onCancel.add(queue.cancel)
  await queue.run()
  if (failed.length) {
    ctrl.log.warn('unable to download images', failed)
    ctrl.setMessage(i18n.t('server_cant_find_images', [failed.length]))
    const lastErr = failed[failed.length - 1].err
    if (lastErr instanceof axios.Cancel) {
      throw lastErr
    }
  }
}

export function getMissingServerAssets (ctrl: StepController) {
  return SyncService.getMissingAssets(ctrl.source)
}

export async function uploadAssets (ctrl: StepController, assetIds: string[]) {
  const { deviceUUID } = await SyncService.getDeviceInfo()
  const failed: {err: Error, asset: string }[] = []
  const initialAvgSize = 1024 * 1024
  let completedBytes = 0
  const MB = 1024 * 1024
  const setProgress = debounce(ctrl.setProgress, 1000)
  setProgress(0, (assetIds.length * initialAvgSize) / MB, true)
  const queue = new AsyncQueue<string>(async assetId => {
    try {
      const path = `/sync/device/${deviceUUID}/upload/asset/${assetId}`
      const entry = await (await file.dataDirectory('assets')).getFile(assetId)
      const completedCount = queue.total - queue.pending.length
      const totalSizeEstimate = completedBytes + (completedBytes / completedCount) * queue.pending.length
      const res = await SyncService.uploadEntry(path, entry, {}, p => {
        setProgress(roundDecimals((p.loaded + completedBytes) / MB), roundDecimals((p.total + totalSizeEstimate) / MB), true)
      })
      completedBytes += await entry.size()
      setProgress(roundDecimals((completedBytes) / MB), roundDecimals(totalSizeEstimate / MB), true)
    } catch (err) {
      failed.push({ err, asset: assetId })
    }
  }, 2)
  ctrl.onCancel.add(() => queue.cancel())
  queue.add(...assetIds)
  await queue.run()
  if (failed.length) {
    ctrl.log.warn('unable to upload assets', failed)
    ctrl.setMessage(i18n.t('server_rejected_assets', [failed.length]))
    const lastErr = failed[failed.length - 1].err
    if (lastErr instanceof axios.Cancel) {
      throw lastErr
    }
  }
  return queue.run()
}
