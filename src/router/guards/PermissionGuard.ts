import UserService from '../../services/user'
import { TrellisPermission } from '../../static/permissions.base'
import PermissionService from '../../services/permission'
import { GuardConfig } from '../GuardQueue'
import { i18n } from '@/i18n'
import { alert } from '@/helpers/log.helper'

export default function (permissions: TrellisPermission | TrellisPermission[]): GuardConfig {
  return {
    name: 'PermissionGuard',
    async condition () {
      const user = await UserService.loadCurrentUser()
      const userPermissions = await PermissionService.loadIfNotLoaded(user)
      return PermissionService.hasPermission(userPermissions, permissions)
    },
    failed () {
      alert('error', i18n.t('permission_has_been_denied'))
    }
  }
}
