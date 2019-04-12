
import UserService, {webService as userService} from '../user/UserService'
import http, {setToken, removeToken, Token} from '../http/AxiosInstance'
import LoginServiceInterface from './LoginServiceInterface'

export default class LoginServiceWeb implements LoginServiceInterface {

  async login (username, password) {
    let res = await http().post(`login`, {
      username: username,
      pass: password
    })
    if (res.status >= 200 && res.status < 300) {
      setToken(res.data.token as Token)
      const user = await userService.loadCurrentUser()
      await UserService.setCurrentUser(user)
    } else {
      throw Error('Unable to log in to this form with the provided credentials')
    }
    return res
  }

  async isLoggedIn (): Promise<boolean> {
    const res = await http().get(`user/me`)
    return (res.status === 200)
  }

  async logout () {
    removeToken()
    UserService.removeCurrentUser()
  }
}
