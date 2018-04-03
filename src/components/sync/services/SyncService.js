import axios from 'axios'
import md5 from 'blueimp-md5'
import config from '@/config'
import { DeviceService } from '@/services/device/DeviceService'
class SyncService {
  constructor () {
    this.deviceId = DeviceService.getUUID()
    this.instance = axios.create({
      baseURL: config.apiRoot,
      timeout: 20000,
      headers: {'X-Key': config.xKey}
    })
  }
  getHeartbeat () {
    return this.instance.get(`heartbeat`)
      .then(response => {
        return response.data
      })
      .catch(err => {
        console.error(err)
        throw err
      })
  }
  getLatestSnapshot () {
    return this.instance.get('device/3c586040f3f7a483/syncv2/snapshot')
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
}

export default new SyncService()
