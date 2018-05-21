import config from '@/config'
import { APP_MODE, APP_ENV } from '@/constants'
import ZipServiceMock from './ZipServiceMock'
import ZipServiceCordova from './ZipServiceCordova'

let ZipServiceConstructor = null
if (config.appEnv === APP_ENV.CORDOVA) {
  ZipServiceConstructor = (config.appMode === APP_MODE.TEST) ? ZipServiceMock : ZipServiceCordova
} else {
  ZipServiceConstructor = ZipServiceMock
}

export const ZipService = new ZipServiceConstructor()
export default ZipService
