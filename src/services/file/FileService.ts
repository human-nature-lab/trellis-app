import { switchByModeEnv } from '../util'
import FileServiceMock from './FileServiceMock'
import FileServiceCordova from './FileServiceCordova'

export const FileService = switchByModeEnv({
  WEB: FileServiceMock,
  CORDOVA: FileServiceCordova
})


const fs  = new FileService()
// @ts-ignore
window.fs = fs
export default fs
