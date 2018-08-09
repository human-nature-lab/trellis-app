import Sync from '../../entities/trellis-config/Sync'
import uuid from 'uuid/v4'
import DatabaseService from '../database/DatabaseService'
import { DeviceService } from '../device/DeviceService'
import { syncInstance as http } from '../http/AxiosInstance'

class SyncService {
  constructor () {
    this.deviceId = DeviceService.getUUID()
    this.synced = false
  }
  async createSync (type, deviceId) {
    const sync = new Sync()
    sync.id = uuid()
    sync.type = type
    sync.status = 'running'
    sync.deviceId = deviceId
    sync.fileName = ''
    sync.createdAt = new Date()
    const connection = await DatabaseService.getConfigDatabase()
    await connection.manager.save(sync)
    return sync
  }
  getHeartbeat (source) {
    let options = {}
    if (source) { options.cancelToken = source.token }
    return http.get(`heartbeat`, options)
      .then(response => {
        return response.data
      })
      .catch(err => {
        console.error(err)
        throw err
      })
  }
  authenticate (source, deviceId) {
    let options = {}
    if (source) { options.cancelToken = source.token }
    return http.get(`device/${deviceId}/syncv2/authenticate`, options)
      .then(response => {
        return response.data
      })
      .catch(err => {
        throw err
      })
  }
  getLatestSnapshot (source) {
    return new Promise((resolve, reject) => {
      DeviceService.getUUID()
        .then((deviceId) => {
          let options = {}
          if (source) { options.cancelToken = source.token }
          http.get(`device/${deviceId}/syncv2/snapshot`, options)
            .then(response => {
              resolve(response.data)
            })
            .catch((error) => {
              reject(error)
            })
        })
    })
  }
  getSnapshotFileSize (source, snapshotId) {
    let options = {}
    if (source) { options.cancelToken = source.token }
    return http.get(`snapshot/${snapshotId}/file_size`, options)
      .then(response => {
        return response.data
      })
      .catch(err => {
        throw err
      })
  }
  getImageFileList (source, fileNames) {
    let options = {}
    if (source) { options.cancelToken = source.token }
    return new Promise((resolve, reject) => {
      DeviceService.getUUID()
        .then((deviceId) => {
          http.post(`device/${deviceId}/image_size`, fileNames, options)
            .then(response => {
              resolve(response.data)
            })
        })
        .catch(err => {
          console.error(err)
          reject(err)
        })
    })
  }
  downloadSnapshot (source, onDownloadProgress, snapshotId) {
    let options = {
      timeout: 0,
      responseType: 'blob'
    }
    if (source) { options.cancelToken = source.token }
    if (onDownloadProgress) { options.onDownloadProgress = onDownloadProgress }
    return http.get(`snapshot/${snapshotId}/download`, options)
      .then(response => {
        return response
      })
      .catch(err => {
        console.error(err)
        throw err
      })
  }
  downloadImage (source, fileName) {
    let options = {
      timeout: 0,
      responseType: 'blob'
    }
    if (source) { options.cancelToken = source.token }
    return DeviceService.getUUID()
      .then((deviceId) => http.get(`device/${deviceId}/image/${fileName}`, options))
  }
  hasSynced () {
    return this.synced
  }
  async registerSuccessfulSync (_sync) {
    console.debug('sync', _sync)
    const connection = await DatabaseService.getConfigDatabase()
    const repository = await connection.getRepository(Sync)
    await repository.update({id: _sync.id}, {completedAt: new Date(), status: 'success'})
    /* For debug purposes only */
    const syncs = await repository.find()
    console.debug('syncs', syncs)
    /* For debug purposes only */
  }
  async registerCancelledSync (_sync) {
    console.debug('sync', _sync)
    const connection = await DatabaseService.getConfigDatabase()
    const repository = await connection.getRepository(Sync)
    await repository.update({id: _sync.id}, {status: 'cancelled'})
    /* For debug purposes only */
    const syncs = await repository.find()
    console.debug('syncs', syncs)
    /* For debug purposes only */
  }
}

export default new SyncService()
