import {switchByModeEnv} from '../util'
import FileServiceMock from './FileServiceMock'
import FileServiceCordova from './FileServiceCordova'

const Constructor = switchByModeEnv({
  WEB: FileServiceMock,
  CORDOVA: FileServiceCordova
})

export const FileService = new Constructor()
export default FileService
