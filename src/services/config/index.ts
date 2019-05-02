import ConfigServiceCordova from './ConfigServiceCordova'
import ConfigServiceWeb from './ConfigServiceWeb'
import switchByModeEnv from '../util'

const ConfigService = switchByModeEnv({
  WEB: ConfigServiceWeb,
  CORDOVA: ConfigServiceCordova
})

export default new ConfigService()
