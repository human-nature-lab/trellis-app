import Role from '../../entities/trellis/Role'
import RoleServiceInterface from './RoleServiceInterface'

export default class RoleServiceCordova implements RoleServiceInterface {

  async create (role: Role): Promise<Role> {
    throw new Error('Not implemented')
  }

  async remove (roleId: string): Promise<void> {
    throw new Error('Not implemented')
  }

  async copyPermissions (fromRole: Role, toRole: Role): Promise<Role> {
    throw new Error('Not implemented')
  }

}
