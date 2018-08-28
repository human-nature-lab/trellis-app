import storage from '../storage/StorageService'
import User from '../../entities/trellis/User'

const CURRENT_USER_KEY = 'current-user'
export abstract class UserServiceAbstract {

  private _user: User

  set user (user: User) {
    this._user = user
    storage.set(CURRENT_USER_KEY, user.toSnakeJSON())
  }

  get user (): User {
    if (this._user) {
      return this._user
    } else {
      let jsonUser = storage.get(CURRENT_USER_KEY)
      let user = null
      if (jsonUser) {
        user = new User().fromSnakeJSON(jsonUser)
        this._user = user
      }
      return user
    }
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
    storage.delete(CURRENT_USER_KEY)
  }


}
