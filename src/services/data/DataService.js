import config from '@/config'
import { APP_MODE } from '@/constants'
import DataServiceMock from './DataServiceMock'
import DataServiceWeb from './DataServiceWeb'

const DataService = (config.appMode === APP_MODE.TEST) ? DataServiceMock : DataServiceWeb
export default DataService
