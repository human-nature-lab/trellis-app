import {switchByModeEnv} from '../util'
import UserServiceWeb from './UserServiceWeb'
import UserServiceCordova from './UserServiceCordova'

export const UserService = switchByModeEnv({
  WEB: UserServiceWeb,
  CORDOVA: UserServiceCordova
})

export default new UserService()
