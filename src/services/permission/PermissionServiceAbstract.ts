import Mutex from 'async-mutex/lib/Mutex'
import RolePermission from '../../entities/trellis/RolePermission'
import User from '../../entities/trellis/User'
import {
  PermissionMap,
  TrellisPermission
} from '../../static/permissions.base'

export default abstract class PermissionServiceAbstract {

  private hasLoadedOnce: boolean = false
  private mutex: Mutex = new Mutex()
  public userPermissions: PermissionMap  // A reactive memory object that Vue can observe

  constructor () {
    this.userPermissions = {} as PermissionMap
    this.resetUserPermissions()
  }

  /**
   * Returns a valid permission map for the supplied user and updates the user permissions in memory.
   * TODO: The updated permissions should be stored and retrieved from the database.
   * @param user
   */
  public async getUserPermissions (user: User): Promise<PermissionMap> {

    this.resetUserPermissions()

    // Get permissions for this user only if they've logged in
    if (user) {
      let updatedPermissions = await this.fetchUserPermissions(user)
      for (const p of updatedPermissions) {
        this.userPermissions[TrellisPermission[p]] = true
      }
    }

    this.hasLoadedOnce = true
    return this.userPermissions
  }

  /**
   * Return the user permissions to their default values.
   */
  public resetUserPermissions (): PermissionMap {
    this.hasLoadedOnce = false
    // Reset all permissions to false
    for (const p in TrellisPermission) {
      this.userPermissions[p] = false
    }
    return this.userPermissions
  }

  /**
   * Ensure that the user permissions get loaded at least once.
   * @param user
   */
  public async loadIfNotLoaded (user: User): Promise<PermissionMap> {
    const release = await this.mutex.acquire()
    try {
      if (!this.hasLoadedOnce) {
        await this.getUserPermissions(user)
      }
    } finally {
      release()
    }
    return this.userPermissions
  }

  /**
   * Evaluates a set of permissions. Returns true if they have permission.
   * @param userPermissions
   * @param permissions
   */
  public hasPermission (userPermissions: PermissionMap, permissions: TrellisPermission | TrellisPermission[]): boolean {
    if (!userPermissions) {
      return false
    }
    if (!Array.isArray(permissions)) {
      permissions = [permissions]
    }
    for (const perm of permissions) {
      if (userPermissions[perm]) {
        return true
      }
    }
    return false
  }

  /**
   * This function is responsible for actually accessing the database.
   * @param user
   */
  protected abstract fetchUserPermissions (user: User): PromiseLike<string[]>

  /**
   * Update a single permission for one role.
   * @param rolePermission
   */
  abstract updateRolePermission (rolePermission: RolePermission): PromiseLike<RolePermission>

}
