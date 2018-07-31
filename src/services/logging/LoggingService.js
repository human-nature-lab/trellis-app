import {switchByModeEnv} from '../util'
import LoggingServiceWeb from './LoggingServiceWeb'
import LoggingServiceCordova from './LoggingServiceCordova'

const Constructor = switchByModeEnv({
  WEB: LoggingServiceWeb,
  CORDOVA: {
    PROD: LoggingServiceCordova,
    TEST: LoggingServiceCordova
  }
})

export const LoggingService = new Constructor()
export default LoggingService
