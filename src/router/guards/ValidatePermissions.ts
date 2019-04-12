import {Route} from "vue-router";
import UserService from "../../services/user/UserService";
import {TrellisPermission} from "../../static/permissions.base";
import PermissionService from '../../services/permission'

export default function (permissions: TrellisPermission | TrellisPermission[]) {
  return async function (to: Route, from: Route, next) {
    const user = await UserService.loadCurrentUser()
    const userPermissions = await PermissionService.loadIfNotLoaded(user)
    if (PermissionService.hasPermission(userPermissions, permissions)) {
      next()
    } else {
      next({name: 'Home'})
    }
  }
}
