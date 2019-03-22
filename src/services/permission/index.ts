import {switchByModeEnv} from '../util'
import PermissionServiceWeb from './PermissionServiceWeb'
import PermissionServiceCordova from './PermissionServiceCordova'

const PermissionService = switchByModeEnv({
  WEB: PermissionServiceWeb,
  CORDOVA: PermissionServiceCordova
})

export default new PermissionService()
