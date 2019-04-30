import User from "../../entities/trellis/User";
import defaultPermissions, {
  PermissionMap,
  adminPermissions,
  TrellisRole,
  TrellisPermission
} from "../../static/permissions.base";

export default abstract class PermissionServiceAbstract {

  private hasLoadedOnce: boolean = false
  public userPermissions: PermissionMap = Object.assign({}, defaultPermissions)    // A reactive memory object that Vue can observe

  /**
   * Returns a valid permission map for the supplied user and updates the user permissions in memory.
   * TODO: The updated permissions should be stored and retrieved from the database.
   * @param user
   */
  public async getUserPermissions (user: User): Promise<PermissionMap> {

    this.resetUserPermissions()

    // Enable admin permissions
    let updatedPermissions = user && user.role === TrellisRole.ADMIN ? adminPermissions : []
    for (const p of updatedPermissions) {
      this.userPermissions[p] = true
    }

    this.hasLoadedOnce = true
    if (user) {
      // console.log('permissions for', user, this.userPermissions)
    }
    return this.userPermissions
  }

  /**
   * Return the user permissions to their default values.
   */
  public resetUserPermissions (): PermissionMap {
    // Reset to default permissions
    for (const p in defaultPermissions) {
      this.userPermissions[p] = defaultPermissions[p]
    }
    return this.userPermissions
  }

  /**
   * Ensure that the user permissions get loaded at least once.
   * @param user
   */
  public async loadIfNotLoaded (user: User): Promise<PermissionMap> {
    if (!this.hasLoadedOnce) {
      return this.getUserPermissions(user)
    } else {
      return this.userPermissions
    }
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

}
