import DeviceServiceMock from './DeviceServiceMock'
import DeviceServiceCordova from './DeviceServiceCordova'
import switchByModeEnv from '../util'

const DeviceService = switchByModeEnv({
  WEB: DeviceServiceMock,
  CORDOVA: DeviceServiceCordova
})

export default new DeviceService()
