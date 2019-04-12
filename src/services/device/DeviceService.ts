import DeviceServiceWeb from './DeviceServiceWeb'
import DeviceServiceCordova from './DeviceServiceCordova'
import switchByModeEnv from '../util'

const DeviceService = switchByModeEnv({
  WEB: DeviceServiceWeb,
  CORDOVA: DeviceServiceCordova
})

export default new DeviceService()
