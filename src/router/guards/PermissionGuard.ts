import UserService from '../../services/user/UserService'
import { TrellisPermission } from '../../static/permissions.base'
import PermissionService from '../../services/permission'
import { GuardConfig } from '../GuardQueue'

export default function (permissions: TrellisPermission | TrellisPermission[]): GuardConfig {
  return {
    name: 'PermissionGuard',
    async condition () {
      const user = await UserService.loadCurrentUser()
      const userPermissions = await PermissionService.loadIfNotLoaded(user)
      return PermissionService.hasPermission(userPermissions, permissions)
    }
  }
}
