import { switchByModeEnv } from '../util'
import RoleServiceWeb from './RoleServiceWeb'
import RoleServiceCordova from './RoleServiceCordova'

const RoleService = switchByModeEnv({
  WEB: RoleServiceWeb,
  CORDOVA: RoleServiceCordova
})

export default new RoleService()
