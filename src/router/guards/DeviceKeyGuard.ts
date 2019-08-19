import DeviceService from '../../services/device/DeviceService'
import { GuardConfig } from './GuardQueue'

export default {
  async condition () {
    const key = await DeviceService.getDeviceKey()
    return key && key.length
  },
  redirect () {
    return { name: 'RegisterDevice' }
  }
} as GuardConfig

