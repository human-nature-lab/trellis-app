import http from '../http/AxiosInstance'
import User from '../../entities/trellis/User'
import { UserServiceAbstract } from './UserServiceAbstract'
export class UserServiceWeb extends UserServiceAbstract {

  private _currentUserRequest: Promise<any>

  loadCurrentUser (): Promise<User|null> {
    if (this._currentUserRequest) return this._currentUserRequest
    this._currentUserRequest = new Promise(resolve => {
      if (this.user) {
        return resolve(this.user)
      } else {
        return resolve(http().get(`/user/me`).then(res => {
          if (res.data) {
            this.user = new User().fromSnakeJSON(res.data)
            return this.user
          }
          return res.data
        }))
      }
    }).finally(() => {
      this._currentUserRequest = null
    })
    return this._currentUserRequest
  }

  async getAll (): Promise<User[]> {
    throw new Error('not implemented')
  }

  async addUser (): Promise<User> {
    throw new Error('not implemented')
  }

}

export default UserServiceWeb
