import storage from '../storage/StorageService'
import http, {setToken, removeToken} from '../http/AxiosInstance'

export default class LoginService {

  /**
   * Login to the web app
   * @param {String} username
   * @param {String} password
   * @returns {Promise<Object>}
   */
  static login (username, password) {
    return http().post(`login`, {
      username: username,
      pass: password
    }).then(res => {
      if (res.status >= 200 && res.status < 400) {
        setToken(res.data.token.hash)
        return res
      } else {
        throw Error('Unable to log in to this form with the provided credentials')
      }
    })
  }

  /**
   * Return a boolean if the user is logged in
   * @returns {boolean}
   */
  static isLoggedIn () {
    return storage.get('interview-id', 'string') !== null
  }

  /**
   * Logout of the web app
   * @returns {Promise<null>}
   */
  static logout () {
    return new Promise(resolve => {
      removeToken()
      resolve()
    })
  }
}
