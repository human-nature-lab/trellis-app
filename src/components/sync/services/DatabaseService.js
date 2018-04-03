import config from '@/config'
import constants from '@/constants'
import DatabaseServiceMock from './DatabaseServiceMock'
import DatabaseServiceCordova from './DatabaseServiceCordova'

export const DatabaseService = (config.appMode === constants.APP_MODE.TEST) ? new DatabaseServiceMock() : new DatabaseServiceCordova()

