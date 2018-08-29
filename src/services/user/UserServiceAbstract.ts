import User from '../../entities/trellis/User'

export abstract class UserServiceAbstract {

  private _user: User

  set user (user: User) {
    this._user = user
  }

  get user (): User {
    return this._user
  }

  /**
   * Load the current user and store it in local storage
   * @returns {Promise<Object>}
   */
  abstract loadCurrentUser (): Promise<User>

  /**
   * Get the current user
   * @returns {Object}
   */
  getCurrentUser (): User {
    return this.user
  }

  /**
   * Set the user
   * @param user
   */
  setCurrentUser (user: User): void {
    this.user = user
  }

  /**
   * Remove current user
   */
  removeCurrentUser (): void {
    delete(this._user)
  }
}
