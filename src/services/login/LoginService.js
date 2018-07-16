import storage from '../storage/StorageService'
import http, {setToken} from '../http/AxiosInstance'

export default class LoginService {
  static login (username, password, formId) {
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
  static isLoggedIn () {
    return storage.get('interview-id', 'string') !== null
  }
}
