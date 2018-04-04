import config from '@/config'
import { APP_MODE, APP_ENV } from '@/constants'
import DeviceServiceMock from './DeviceServiceMock'
import DeviceServiceCordova from './DeviceServiceCordova'

let DeviceServiceConstructor = null
if (config.appEnv === APP_ENV.CORDOVA) {
  DeviceServiceConstructor = (config.appMode === APP_MODE.TEST) ? DeviceServiceMock : DeviceServiceCordova
} else {
  DeviceServiceConstructor = DeviceServiceMock
}

export const DeviceService = new DeviceServiceConstructor()
export default DeviceService
