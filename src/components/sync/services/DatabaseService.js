import config from '@/config'
import constants from '@/constants'
import DatabaseServiceMock from './DatabaseServiceMock'
import DatabaseServiceCordova from './DatabaseServiceCordova'

const DatabaseService = (config.appMode === constants.APP_MODE.TEST) ? new DatabaseServiceMock() : new DatabaseServiceCordova()
export default DatabaseService
