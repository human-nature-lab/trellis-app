import { IsNull } from 'typeorm'
import RolePermission from '../../entities/trellis/RolePermission'
import User from '../../entities/trellis/User'
import { TrellisPermission } from '../../static/permissions.base'
import PermissionServiceAbstract from './PermissionServiceAbstract'
import DatabaseService from '../database/DatabaseService'

export class PermissionServiceCordova extends PermissionServiceAbstract {

  protected async fetchUserPermissions (user: User): Promise<string[]> {
    const repo = await DatabaseService.getRepository(RolePermission)

    if (user.roleId.toLowerCase() === 'admin') {
      return Object.keys(TrellisPermission)
    }

    const res = await repo.find({
      deletedAt: IsNull(),
      roleId: user.roleId,
      value: true
    })

    return res.map((p: RolePermission) => p.permissionId)
  }

  async updateRolePermission (rolePermission: RolePermission): Promise<RolePermission> {
    throw new Error('Not implemented')
  }

}
