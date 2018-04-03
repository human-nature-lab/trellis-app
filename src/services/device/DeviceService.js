import config from '@/config'
import constants from '@/constants'
import DeviceServiceMock from './DeviceServiceMock'
import DeviceServiceCordova from './DeviceServiceCordova'

export const DeviceService = (config.appMode === constants.APP_MODE.TEST) ? new DeviceServiceMock() : new DeviceServiceCordova()
