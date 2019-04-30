import http from '../http/AxiosInstance'
import User from '../../entities/trellis/User'
import { UserServiceAbstract } from './UserServiceAbstract'
import {adminInst} from "../http/AxiosInstance";
import UserStudy from "../../entities/trellis/UserStudy";
import Pagination from "../../types/Pagination";

export class UserServiceWeb extends UserServiceAbstract {

  async loadCurrentUser (): Promise<User|null> {
    try {
      if (this.user) {
        return this.user
      } else {
        try {
          let res = await http().get(`/user/me`)
          if (res.status && res.data && res.status >= 200 && res.status < 300) {
            this.user = new User().fromSnakeJSON(res.data)
            return this.user
          } else {
            return null
          }
        } catch (err) {
          return null
        }
      }
    }
  }

  async getPage (page: number = 0, size: number = 100, sortBy: string = 'name', descending: boolean = false): Promise<Pagination<User>> {
    const res = await adminInst.get('user', {
      params: { page, size, sortBy, descending: descending ? 1 : 0, study: 1 }
    })
    const users = res.data.users.map(u => new User().fromSnakeJSON(u))
    return {
      total: res.data.total,
      count: res.data.count,
      start: res.data.start,
      data: users
    }
  }

  async createUser (user: User): Promise<User> {
    const res = await adminInst.post('user', user)
    return new User().fromSnakeJSON(res.data.user)
  }

  async deleteUser (userId: string): Promise<void> {
    userId = encodeURIComponent(userId)
    await adminInst.delete(`user/${userId}`)
  }

  async updateUser (user: User): Promise<User> {
    const userId = encodeURIComponent(user.id)
    const res = await adminInst.put(`user/${userId}`, user)
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
