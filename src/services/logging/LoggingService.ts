import { switchByModeEnv } from '../util'
import LoggingServiceWeb from './LoggingServiceWeb'
import LoggingServiceCordova from './LoggingServiceCordova'

const LoggingService = switchByModeEnv({
  WEB: LoggingServiceWeb,
  CORDOVA: LoggingServiceCordova
})

export default LoggingService

export const defaultLoggingService = new LoggingService()
