import { Mutex } from 'async-mutex'
import http from '../http/AxiosInstance'
import User from '../../entities/trellis/User'
import { uriTemplate } from '../http/WebUtils'
import { UserServiceAbstract } from './UserServiceAbstract'
import { adminInst } from '../http/AxiosInstance'
import UserStudy from '../../entities/trellis/UserStudy'
import Pagination from '../../types/Pagination'

export class UserServiceWeb extends UserServiceAbstract {

  private mutex: Mutex = new Mutex()

  async loadCurrentUser (): Promise<User | null> {
    if (this.user) return this.user
    const release = await this.mutex.acquire()
    let user: User = null
    try {
      if (this.user) {
        user = this.user
      } else {
        let res = await http().get(`/user/me`)
        if (res.status && res.data && res.status >= 200 && res.status < 300) {
          user = new User().fromSnakeJSON(res.data)
          this.user = user
        }
      }
    } catch (err) {
      // Do nothing just return null
    } finally {
      release()
    }
    return user
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
    const res = await adminInst.post('user', user.toSnakeJSON())
    return new User().fromSnakeJSON(res.data.user)
  }

  async deleteUser (userId: string): Promise<void> {
    await adminInst.delete(uriTemplate('user/{userId}', [userId]))
  }

  async updateUser (user: User): Promise<User> {
    const res = await adminInst.put(uriTemplate('user/{userId}', [user.id]), user.toSnakeJSON())
    return new User().fromSnakeJSON(res.data.user)
  }

  async addStudy (user: User, studyId: string): Promise<UserStudy> {
    const res = await adminInst.post(uriTemplate('user/{userId}/studies/{studyId}', [user.id, studyId]))
    return new UserStudy().fromSnakeJSON(res.data.user_study)
  }

  async removeStudy (user: User, studyId: string): Promise<void> {
    await adminInst.delete(uriTemplate('user/{userId}/studies/{studyId}', [user.id, studyId]))
  }

  async updatePassword (user: User, oldPass: string, newPass: string): Promise<void> {
    const res = await adminInst.put(uriTemplate('user/{userId}/update-password', [user.id]), {
      oldPassword: oldPass,
      newPassword: newPass
    })
  }

}

export default UserServiceWeb
