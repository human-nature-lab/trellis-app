import config from '@/config'
import constants from '@/constants'
import DataServiceMock from './DataServiceMock'
import DataServiceWeb from './DataServiceWeb'

const DataService = (config.appMode === constants.APP_MODE.TEST) ? DataServiceMock : DataServiceWeb
export default DataService
