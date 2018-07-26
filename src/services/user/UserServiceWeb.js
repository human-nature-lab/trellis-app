import http from '../http/AxiosInstance'
import storage from '../storage/StorageService'
export default class UserServiceWeb {
  /**
   * Load the current user over the network and store it in local storage
   * @returns {Promise<Object>}
   */
  static loadCurrentUser () {
    return http().get(`/user/me`).then(res => {
      if (res.data) {
        storage.set('user', res.data)
      }
      return res.data
    })
  }

  /**
   * Get the current user object synchronously
   * @returns {Object}
   */
  static getCurrentUser () {
    return storage.get('user')
  }
}
