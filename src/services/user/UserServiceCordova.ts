import User from '../../entities/trellis/User'
import { UserServiceAbstract } from './UserServiceAbstract'
import router from '../../router'
export class UserServiceCordova extends UserServiceAbstract {

  private _currentUserRequest: Promise<any>

  loadCurrentUser (): Promise<User|null> {
    if (this._currentUserRequest) return this._currentUserRequest
    this._currentUserRequest = new Promise(resolve => {
      debugger
      if (this.user) {
        return resolve(this.user)
      } else {
        resolve(null)
        if (router.currentRoute.name !== 'Login') {
          router.push("/login")
        }
      }
    }).finally(() => {
      this._currentUserRequest = null
    })
    return this._currentUserRequest
  }

}

export default UserServiceCordova
