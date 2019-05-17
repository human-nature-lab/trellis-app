import Role from '../../entities/trellis/Role'

export default interface RoleServiceInterface {

  /**
   * Create a new role
   * @param role
   */
  create (role: Role): PromiseLike<Role>

  /**
   * Remove an existing role
   * @param roleId
   */
  remove (roleId: string): PromiseLike<void>

  /**
   * Copy all of the permission from one role to another role.
   * @param fromRole
   * @param toRole
   */
  copyPermissions (fromRole: Role, toRole: Role): PromiseLike<Role>

  /**
   * Get a list of all of the roles available on the server
   */
  all (): PromiseLike<Role[]>

}
