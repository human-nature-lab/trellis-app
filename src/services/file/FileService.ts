import { switchByModeEnv } from '../util'
import FileServiceMock from './FileServiceMock'
import FileServiceCordova from './FileServiceCordova'

export const FileService = switchByModeEnv({
  WEB: FileServiceMock,
  CORDOVA: FileServiceCordova
})

export default new FileService()
