import Role from '../../entities/trellis/Role'
import { uriTemplate } from '../http/WebUtils'
import RoleServiceInterface from './RoleServiceInterface'
import { adminInst } from '../http/AxiosInstance'

export class RoleServiceWeb implements RoleServiceInterface {

  async create (role: Role): Promise<Role> {
    const res = await adminInst.post('role', role.toSnakeJSON())
    return new Role().fromSnakeJSON(res.data.role)
  }

  async remove (roleId: string): Promise<void> {
    await adminInst.delete(uriTemplate('role/{}', [roleId]))
  }

  async copyPermissions (fromRole: Role, toRole: Role): Promise<Role> {
    const res = await adminInst.put('role/copy', {
      fromId: fromRole.id,
      toId: toRole.id
    })
    return new Role().fromSnakeJSON(res.data.role)
  }

  async all (): Promise<Role[]> {
    const res = await adminInst.get('roles')
    return res.data.roles.map(r => new Role().fromSnakeJSON(r))
  }

}
