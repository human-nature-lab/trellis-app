import {switchByModeEnv} from '../util'
import DatabaseServiceMock from './DatabaseServiceMock'
import DatabaseServiceCordova from './DatabaseServiceCordova'

const Constructor = switchByModeEnv({
  WEB: DatabaseServiceMock,
  CORDOVA: DatabaseServiceCordova
})

export const DatabaseService = new Constructor()
export default DatabaseService
