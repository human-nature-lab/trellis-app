import LoginServiceInterface from './LoginServiceInterface'
import DatabaseService from '../database/DatabaseService'
import SingletonService from '../singleton/SingletonService'
import User from '../../entities/trellis/User'

export default class LoginServiceCordova implements LoginServiceInterface {

  async login (username, password) {
    const connection = await DatabaseService.getDatabase()
    const repository = await connection.getRepository(User)
    const user = await repository.findOne({ username: username, password: password, deletedAt: null })
    console.log('user', user)
    if (user === undefined || user === null) {
      throw Error('Unable to log in with the provided credentials')
    }
    SingletonService.set('user', user)
    return user
  }

  async isLoggedIn (): Promise<boolean> {
    return (SingletonService.get('user') instanceof User)
  }

  logout () {
    return new Promise(resolve => {
      SingletonService.set('user', null)
      resolve()
    })
  }
}
