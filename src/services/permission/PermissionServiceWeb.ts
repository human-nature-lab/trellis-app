import Role from '../../entities/trellis/Role'
import RolePermission from '../../entities/trellis/RolePermission'
import User from '../../entities/trellis/User'
import http, { adminInst } from '../http/AxiosInstance'
import Permission from '../../entities/trellis/Permission'
import { uriTemplate } from '../http/WebUtils'
import PermissionServiceAbstract from './PermissionServiceAbstract'

export class PermissionServiceWeb extends PermissionServiceAbstract {

  protected async fetchUserPermissions (user: User): Promise<string[]> {
    const res = await http().get(uriTemplate('role/{role}/permissions', [user.roleId]))
    return res.data.permissions.map(p => p.permission_id)
  }

  public async all (): Promise<{roles: Role[], all: Permission[]}> {
    const res = await adminInst.get('permissions')
    return {
      roles: res.data.roles.map(r => new Role().fromSnakeJSON(r)),
      all: res.data.all.map(a => new Permission().fromSnakeJSON(a))
    }
  }

  async updateRolePermission (rolePermission: RolePermission): Promise<RolePermission> {
    const res = await adminInst.put(uriTemplate('role/{role_id}/permission/{permission_id}', [rolePermission.roleId, rolePermission.permissionId]), {
      value: rolePermission.value
    })
    return new RolePermission().fromSnakeJSON(res.data.rolePermission)
  }

}
