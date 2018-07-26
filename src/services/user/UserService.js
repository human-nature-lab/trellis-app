import {switchByModeEnv} from '../util'
import UserServiceWeb from './UserServiceWeb'

let Constructor = switchByModeEnv({
  WEB: UserServiceWeb,
  CORDOVA: UserServiceWeb
})

export const UserService = Constructor

export default UserService
