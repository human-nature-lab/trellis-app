import {switchByModeEnv} from '../util'
import UserServiceWeb from './UserServiceWeb'
import UserServiceCordova from './UserServiceCordova'

export const webService = new UserServiceWeb()
export const cordovaService = new UserServiceCordova()

export const UserService = switchByModeEnv({
  WEB: webService,
  CORDOVA: cordovaService
})

export default UserService
