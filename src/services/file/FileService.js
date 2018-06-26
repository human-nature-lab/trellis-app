import config from '@/config'
import { APP_ENV } from '@/constants'
import FileServiceMock from './FileServiceMock'
import FileServiceCordova from './FileServiceCordova'

let FileServiceConstructor = null
if (config.appEnv === APP_ENV.CORDOVA) {
  FileServiceConstructor = FileServiceCordova
} else {
  FileServiceConstructor = FileServiceMock
}

export const FileService = new FileServiceConstructor()
export default FileService
