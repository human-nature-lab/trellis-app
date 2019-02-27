import User from '../../entities/trellis/User'
import DatabaseService from '../database/DatabaseService'
import { UserServiceAbstract } from './UserServiceAbstract'
import router from '../../router'
import UserStudy from "../../entities/trellis/UserStudy";
import Pagination from "../../types/Pagination";
export class UserServiceCordova extends UserServiceAbstract {

  private _currentUserRequest: Promise<any>

  loadCurrentUser (): Promise<User|null> {
    if (this._currentUserRequest) return this._currentUserRequest
    this._currentUserRequest = new Promise(resolve => {
      if (this.user) {
        return resolve(this.user)
      } else {
        resolve(null)
      }
    }).finally(() => {
      this._currentUserRequest = null
    })
    return this._currentUserRequest
  }

  async getPage (page: number = 0, size: number = 100): Promise<Pagination<User>> {
    const repo = await DatabaseService.getRepository(User)
    return repo.find({
      take: size,
      skip: page * size
    })
  }

  async createUser (user: User): Promise<User> {
    const repo = DatabaseService.getRepository(User)
    return repo.save(user)
  }

  async deleteUser (userId: string): Promise<void> {
    const repo = DatabaseService.getRepository(User)
    return repo.delete(userId)
  }

  async updateUser (user: User): Promise<User> {
    return this.createUser(user)
  }

  addStudy (user: User, studyId: string): Promise<UserStudy> {
    throw Error('not implemented')
  }

  removeStudy (user: User, studyId: string): Promise<void> {
    throw Error('not implemented')
  }

  async updatePassword (user: User, oldPassword: string, newPassword: string): Promise<void> {
    throw Error('not implemented')
  }

}

export default UserServiceCordova
