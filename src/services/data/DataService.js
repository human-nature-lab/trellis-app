import config from '@/config'
import constants from '@/constants'
import DataServiceMock from './DataServiceMock'
import DataServiceWeb from './DataServiceWeb'

export const DataService = (config.appMode === constants.APP_MODE.TEST) ? DataServiceMock : DataServiceWeb
