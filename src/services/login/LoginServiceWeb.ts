import {webService as userService} from '../user/UserService'
import http, {setToken, removeToken} from '../http/AxiosInstance'
import LoginServiceInterface from './LoginServiceInterface'
import singleton from '../../static/singleton'

export default class LoginServiceWeb implements LoginServiceInterface {

  async login (username, password) {
    let res = await http().post(`login`, {
      username: username,
      pass: password
    })
    if (res.status >= 200 && res.status < 400) {
      setToken(res.data.token.hash)
      userService.user = null
      singleton.user = await userService.loadCurrentUser()
    } else {
      throw Error('Unable to log in to this form with the provided credentials')
    }
    return res
  }

  async isLoggedIn (): Promise<boolean> {
    const res = await http().get(`user/me`)
    return (res.status === 200)
  }

  logout () {
    return new Promise((resolve, reject) => {
      removeToken()
      resolve()
    })
  }
}
