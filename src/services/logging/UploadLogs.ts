import {syncInstance} from '../http/AxiosInstance'
import DatabaseService from '../database/DatabaseService'
import Log from "../../entities/trellis-config/Log";
import {IsNull} from "typeorm";
import merge from 'lodash/merge'
import DeviceService from "../device/DeviceService";


interface LogUploadOptions {
  progress?: Function
  batchSize?: number
  maxBatches?: number
}

const defaultOptions = {
  batchSize: 200,
  maxBatches: 100
}

/**
 * Upload all of the logs that haven't been uploaded yet and return the number of logs that were uploaded
 * @returns {Promise<number>}
 */
export default async function uploadLogs (opts?: LogUploadOptions): Promise<number> {
  opts = merge(defaultOptions, opts)
  const deviceId = await DeviceService.getUUID()
  const batchSize = opts.batchSize
  const maxBatches = opts.maxBatches
  const progress = opts.progress
  const repo = await DatabaseService.getConfigRepository(Log)
  const http = await syncInstance()
  const toProcessCount: number = await repo.count({
    uploadedAt: IsNull()
  })
  let processedCount: number = 0
  let c = 0
  if (progress) {
    progress(processedCount, toProcessCount)
  }
  while (processedCount < toProcessCount && c < maxBatches) {
    c++
    let logs = await repo.find({
      where: {
        uploadedAt: IsNull()
      },
      take: batchSize
    })
    if (logs.length) {
      let res = await http.post(`/device/${deviceId}/upload/logs`, { logs: logs.map(l => l.toSnakeJSON()) }, {})
      if (res.data.count !== logs.length) {
        throw new Error('Failed to upload all logs in this batch')
      } else {
        await repo.save(logs.map(l => {
          l.uploadedAt = new Date()
          return l
        }))
        processedCount += logs.length
      }
      if (progress) {
        progress(processedCount, toProcessCount)
      }
    }
  }
  if (c === maxBatches) {
    throw new Error(`Failed to upload all logs. Exceeded maximum batch calls of ${maxBatches}`)
  }
  return processedCount
}
