import axios from 'axios'
import xxhash from 'xxhashjs'
import config from '../../../config'
import DeviceService from '../../../services/DeviceService'
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
    return xxhash.h64(file, 0xABCD).toString(16)
  }
}

export default new SyncService()
