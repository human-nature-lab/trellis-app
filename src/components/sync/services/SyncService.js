import md5 from 'blueimp-md5'
import { DeviceService } from '@/services/device/DeviceService'
import http from '@/services/http/AxiosInstance'
class SyncService {
  constructor () {
    this.synced = false
    this.deviceId = DeviceService.getUUID()
  }
  getHeartbeat (source) {
    let options = {}
    if (source) { options.cancelToken = source.token }
    return http().get(`heartbeat`, options)
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
    return http().get(`device/${deviceId}/syncv2/authenticate`, options)
      .then(response => {
        return response.data
      })
      .catch(err => {
        console.error(err)
        throw err
      })
  }
  getLatestSnapshot (source) {
    // TODO: pass in or get device ID from device
    let options = {}
    if (source) { options.cancelToken = source.token }
    return http().get('device/3c586040f3f7a483/syncv2/snapshot', options)
      .then(response => {
        return response.data
      })
      .catch(err => {
        console.error(err)
        throw err
      })
  }
  getSnapshotFileSize (source, snapshotId) {
    console.log('getSnapshotFileSize.snapshotId', snapshotId)
    let options = {}
    if (source) { options.cancelToken = source.token }
    return http().get(`snapshot/${snapshotId}/file_size`, options)
      .then(response => {
        return response.data
      })
      .catch(err => {
        console.error(err)
        throw err
      })
  }
  getHash (file) {
    return md5(file)
  }
  hasSynced () {
    return this.synced
  }
}

export default new SyncService()
