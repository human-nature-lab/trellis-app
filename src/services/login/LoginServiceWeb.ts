import UserService from '../user/UserService'
import http, {setToken, removeToken} from '../http/AxiosInstance'
import LoginServiceInterface from "./LoginServiceInterface";

export default class LoginServiceWeb implements LoginServiceInterface {

  login (username, password) {
    return http().post(`login`, {
      username: username,
      pass: password
    }).then(res => {
      if (res.status >= 200 && res.status < 400) {
        setToken(res.data.token.hash)
        UserService._user = null
        UserService.loadCurrentUser()
        return res
      } else {
        throw Error('Unable to log in to this form with the provided credentials')
      }
    })
  }

  async isLoggedIn (): Promise<boolean> {
    const res = await http().get(`user/me`)
    return (res.status === 200)
  }

  logout () {
    return new Promise(resolve => {
      removeToken()
      resolve()
    })
  }
}
