import config from '@/config'
import { APP_ENV } from '@/constants'
import DatabaseServiceMock from './DatabaseServiceMock'
import DatabaseServiceCordova from './DatabaseServiceCordova'

let Constructor = null
if (config.appEnv === APP_ENV.CORDOVA) {
  Constructor = DatabaseServiceCordova
} else {
  Constructor = DatabaseServiceMock
}
export const DatabaseService = new Constructor()
export default DatabaseService
