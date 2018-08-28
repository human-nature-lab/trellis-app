import User from '../../entities/trellis/User'
import { UserServiceAbstract } from './UserServiceAbstract'
export class UserServiceCordova extends UserServiceAbstract {

  private _currentUserRequest: Promise<any>

  loadCurrentUser (): Promise<User|null> {
    if (this._currentUserRequest) return this._currentUserRequest
    this._currentUserRequest = new Promise(resolve => {
      if (this.user) {
        return resolve(this.user)
      } else {
        return resolve(null)
      }
    }).finally(() => {
      this._currentUserRequest = null
    })
    return this._currentUserRequest
  }

}

export default new UserServiceCordova()
