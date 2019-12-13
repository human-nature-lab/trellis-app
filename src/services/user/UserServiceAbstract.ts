import User from '../../entities/trellis/User'
import UserStudy from '../../entities/trellis/UserStudy'
import Pagination from '../../types/Pagination'
import PermissionService from '../permission'
import SingletonService from '../SingletonService'

export abstract class UserServiceAbstract {

  private _user: User

  set user(user: User) {
    this._user = user
  }

  get user(): User {
    return this._user
  }

  /**
   * Load the current user and store it in local storage
   * @returns {Promise<Object>}
   */
  abstract loadCurrentUser(): Promise<User>

  /**
   * Get the current user
   * @returns {Object}
   */
  async getCurrentUser (): Promise<User> {
    if (this.user) return this.user
    const user = await this.loadCurrentUser()
    if (user instanceof User) {
      await this.setCurrentUser(user)
    }
    return this.user
  }

  /**
   * Set the user
   * @param user
   */
  async setCurrentUser(user: User): Promise<void> {
    this.user = user
    SingletonService.set('user', user)
    PermissionService.resetUserPermissions()
    await PermissionService.loadIfNotLoaded(user)
  }

  /**
   * Remove current user
   */
  removeCurrentUser(): void {
    delete(this._user)
    SingletonService.set('user', null)
    PermissionService.resetUserPermissions()
  }

  /**
   * Get all users
   */
  abstract getPage(page?: number, size?: number, sortBy?: string, descending?: boolean): Promise<Pagination<User>>

  /**
   * Create a new user
   * @returns {Promise<User>}
   */
  abstract createUser (user: User): Promise<User>

  /**
   * Delete a single user
   * @param userId
   */
  abstract deleteUser (userId: string): Promise<void>

  /**
   * Persist changes to a single user
   * @param user
   */
  abstract updateUser (user: User): Promise<User>

  /**
   * Add a study to a user
   * @param {User} user
   * @param {string} studyId
   * @returns {PromiseLike<UserStudy>}
   */
  abstract addStudy (user: User, studyId: string): PromiseLike<UserStudy>

  /**
   * Remove a study from a user
   * @param {User} user
   * @param {string} studyId
   * @returns {PromiseLike<void>}
   */
  abstract removeStudy (user: User, studyId: string): PromiseLike<void>

  /**
   * Update a user's password
   * @param {User} user
   * @param {string} oldPassword
   * @param {string} newPassword
   * @returns {PromiseLike<User>}
   */
  abstract updatePassword (user: User, oldPassword: string, newPassword: string): PromiseLike<void>
}
