import {switchByModeEnv} from '../util'
import ZipServiceMock from './ZipServiceMock'
import ZipServiceCordova from './ZipServiceCordova'

const Constructor = switchByModeEnv({
  WEB: ZipServiceMock,
  CORDOVA: {
    PROD: ZipServiceCordova,
    TEST: ZipServiceCordova
  }
})

export const ZipService = new Constructor()
export default ZipService
