import http from '../http/AxiosInstance'
import User from '../../entities/trellis/User'
import { UserServiceAbstract } from './UserServiceAbstract'
import {adminInst} from "../http/AxiosInstance";
import UserStudy from "../../entities/trellis/UserStudy";

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

  async getPage (page: number = 0, size: number = 100): Promise<User[]> {
    const res = await adminInst.get('user', {
      params: { page, size, study: 1 }
    })
    return res.data.users.map(u => new User().fromSnakeJSON(u))
  }

  async createUser (user: User): Promise<User> {
    const res = await adminInst.post('user', user)
    debugger
    return new User().fromSnakeJSON(res.data.user)
  }

  async deleteUser (userId: string): Promise<void> {
    userId = encodeURIComponent(userId)
    await adminInst.delete(`user/${userId}`)
  }

  async updateUser (user: User): Promise<User> {
    const userId = encodeURIComponent(user.id)
    const res = await adminInst.put(`user/${userId}`, user)
    debugger
    return new User().fromSnakeJSON(res.data.user)
  }

  async addStudy (user: User, studyId: string): Promise<UserStudy> {
    const userId = encodeURIComponent(user.id)
    studyId = encodeURIComponent(studyId)
    const res = await adminInst.post(`user/${userId}/studies/${studyId}`)
    return new UserStudy().fromSnakeJSON(res.data.user_study)
  }

  async removeStudy (user: User, studyId: string): Promise<void> {
    const userId = encodeURIComponent(user.id)
    studyId = encodeURIComponent(studyId)
    await adminInst.delete(`user/${userId}/studies/${studyId}`)
  }

  async updatePassword (user: User, oldPass: string, newPass: string): Promise<void> {
    const userId = encodeURIComponent(user.id)
    const res = await adminInst.put(`user/${userId}/update-password`, {
      oldPassword: oldPass,
      newPassword: newPass
    })
  }

}

export default UserServiceWeb
