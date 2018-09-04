import LoginServiceInterface from './LoginServiceInterface'
import DatabaseService from '../database/DatabaseService'
import UserService from '../user/UserService'
import User from '../../entities/trellis/User'
import singleton from '../../static/singleton'
import bcrypt from 'bcryptjs'

export default class LoginServiceCordova implements LoginServiceInterface {

  async login (username, password) {
    const connection = await DatabaseService.getDatabase()
    const repository = await connection.getRepository(User)
    const user = await repository.findOne({ username: username, deletedAt: null })
    if (user === undefined || user === null) {
      throw Error('Unable to log in with the provided credentials (user not found)')
    }
    if (! bcrypt.compareSync(password, user.password)) {
      throw Error('Unable to log in with the provided credentials (incorrect password)')
    }
    UserService.setCurrentUser(user)
    singleton.user = user
    return user
  }

  async isLoggedIn (): Promise<boolean> {
    const user = await UserService.getCurrentUser()
    return (user instanceof User)
  }

  logout () {
    return new Promise(resolve => {
      UserService.removeCurrentUser()
      resolve()
    })
  }
}
