import {switchByModeEnv} from '../util'
import DatabaseServiceMock from './DatabaseServiceMock'
import DatabaseServiceCordova from './DatabaseServiceCordova'

export const DatabaseService = switchByModeEnv({
  WEB: DatabaseServiceMock,
  CORDOVA: DatabaseServiceCordova
})

const dbDefault = new DatabaseService()
export default dbDefault

window.dbDefault = dbDefault
