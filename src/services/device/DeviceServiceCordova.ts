import Config from '../../entities/trellis-config/Config'
import Pagination from '../../types/Pagination'
import { resetSyncCredentials, setSyncCredentials, syncInstance } from '../http/AxiosInstance'
import DeviceServiceInterface from './DeviceServiceInterface'
import Device from '../../entities/trellis/Device'

declare const device
declare const cordova

const deviceKeyKey = 'device-key'

export class DeviceServiceCordova implements DeviceServiceInterface {
  private isReady: boolean = false
  private platform: string
  private uuid: string
  private deviceKey!: string
  constructor () {
    this.isReady = false
    this.uuid = undefined
    this.platform = undefined
    document.addEventListener('deviceready', () => { this.isReady = true }, false)
  }

  public async getDeviceKey () {
    if (this.deviceKey) {
      return this.deviceKey
    }
    await this.isDeviceReady()
    const DatabaseService = (await import('../database')).default
    const repo = await DatabaseService.getConfigRepository(Config)
    const entry = await repo.findOne({
      where: {
        name: deviceKeyKey,
      },
    })
    if (entry) {
      this.deviceKey = entry.val
      return entry.val
    } else {
      return null
    }
  }

  getUUID (): Promise<string> {
    return new Promise((resolve) => {
      if (this.uuid !== undefined) {
        resolve(this.uuid)
      } else {
        this.isDeviceReady()
          .then(() => {
            this.uuid = device.uuid
            resolve(this.uuid)
          })
      }
    })
  }
  getPlatform () {
    return new Promise((resolve) => {
      if (this.platform !== undefined) {
        resolve(this.platform)
      } else {
        this.isDeviceReady()
          .then(() => {
            this.platform = device.platform
            resolve(this.platform)
          })
      }
    })
  }
  getFreeDiskSpace (): Promise<number> {
    return new Promise((resolve, reject) => {
      this.isDeviceReady()
        .then(() => {
          cordova.exec((result) => {
            // Android reports free space in kB; if this is an android device, multiply by 1000 to get bytes
            let bytes = (device.platform === 'Android') ? result * 1000 : result
            resolve(bytes)
          },
          (error) => reject(error),
          'File', 'getFreeDiskSpace', [])
        })
    })
  }
  setDeviceReady (isReady) {
    this.isReady = isReady
  }
  isDeviceReady (): Promise<boolean> {
    return new Promise(resolve => {
      const checkReady = () => {
        if (this.isReady) {
          resolve(true)
        } else {
          setTimeout(checkReady, 500)
        }
      }
      checkReady()
    })
  }

  getDevices (pagination: Pagination<Device>): Promise<Pagination<Device>> {
    throw new Error('Not implemented')
  }

  async deleteDevice (deviceId: string): Promise<void> {
    throw new Error('Not implemented')
  }

  async updateDevice (device: Device): Promise<Device> {
    throw new Error('Not implemented')
  }

  async createDevice (device: Device): Promise<Device> {
    let r = null
    try {
      const http = await syncInstance()
      const res = await http.post('device', {
        device: device.toSnakeJSON()
      })
      r = new Device().fromSnakeJSON(res.data.device)
    } finally {
      await resetSyncCredentials()
    }
    return r
  }

  async setDeviceKey (device: Device): Promise<void> {
    await this.isDeviceReady()
    const DatabaseService = (await import('../database')).default
    const repo = await DatabaseService.getConfigRepository(Config)
    const entry = new Config()
    entry.name = deviceKeyKey
    entry.val = device.key
    await repo.save(entry)
    this.deviceKey = device.key
  }

  async removeDeviceKey (): Promise<void> {
    const DatabaseService = (await import('../database')).default
    const repo = await DatabaseService.getConfigRepository(Config)
    const entry = new Config()
    entry.name = deviceKeyKey
    await repo.delete(entry)
    this.deviceKey = null
  }

}
