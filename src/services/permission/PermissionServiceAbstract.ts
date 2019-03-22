import User from "../../entities/trellis/User";
import defaultPermissions, {PermissionMap, TrellisPermission, TrellisRole} from "../../static/permissions.base";

export default abstract class PermissionServiceAbstract {

  private hasLoadedOnce: boolean = false
  public userPermissions: PermissionMap = Object.assign({}, defaultPermissions)    // A reactive memory object that Vue can observe

  /**
   * Returns a valid permission map for the supplied user and updates the user permissions in memory.
   * TODO: The updated permissions should be stored and retrieved from the database.
   * @param user
   */
  public async getUserPermissions (user: User): Promise<PermissionMap> {
    const adminPermissions = [
      TrellisPermission.ADD_USER,
      TrellisPermission.CREATE_STUDY,
      TrellisPermission.DELETE_RESPONDENT,
      TrellisPermission.CHANGE_RESPONDENT_CURRENT
    ]

    this.resetUserPermissions()

    // Enable admin permissions
    let updatedPermissions = user.role === TrellisRole.ADMIN ? adminPermissions : []
    for (const p of updatedPermissions) {
      this.userPermissions[p] = true
    }

    this.hasLoadedOnce = true
    console.log('permissions for', user.username, this.userPermissions)
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

}
