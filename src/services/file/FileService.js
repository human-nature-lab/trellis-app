import config from '@/config'
import { APP_MODE, APP_ENV } from '@/constants'
import FileServiceMock from './FileServiceMock'
import FileServiceCordova from './FileServiceCordova'

let FileServiceConstructor = null
if (config.appEnv === APP_ENV.CORDOVA) {
  FileServiceConstructor = (config.appMode === APP_MODE.TEST) ? FileServiceMock : FileServiceCordova
} else {
  FileServiceConstructor = FileServiceMock
}

export const FileService = new FileServiceConstructor()
export default FileService
