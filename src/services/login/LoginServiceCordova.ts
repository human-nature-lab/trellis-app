import ConfigService from '../config'

import LoginServiceInterface from './LoginServiceInterface'
import DatabaseService from '../database'
import UserService from '../user'
import User from '../../entities/trellis/User'
import bcrypt from 'bcryptjs'

export class LoginServiceCordova implements LoginServiceInterface {

  async login (username, password) {
    const connection = await DatabaseService.getDatabase()
    const repository = await connection.getRepository(User)
    const user = await repository.findOne({ username: username, deletedAt: null })
    if (user === undefined || user === null) {
      throw Error('Unable to log in with the provided credentials (user not found)')
    }
    if (!bcrypt.compareSync(password, user.password)) {
      throw Error('Unable to log in with the provided credentials (incorrect password)')
    }
    await UserService.setCurrentUser(user)
    await ConfigService.load()
    return user
  }

  async isLoggedIn (): Promise<boolean> {
    const user = await UserService.getCurrentUser()
    return (user instanceof User)
  }

  async logout () {
    UserService.removeCurrentUser()
  }
}
