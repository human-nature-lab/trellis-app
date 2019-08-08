import { switchByModeEnv } from '../util'
import LoginServiceWeb from './LoginServiceWeb'
import LoginServiceCordova from './LoginServiceCordova'

export const LoginService = switchByModeEnv({
  WEB: LoginServiceWeb,
  CORDOVA: LoginServiceCordova
})

export default new LoginService()
