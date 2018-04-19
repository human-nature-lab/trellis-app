import storage from '@/services/storage/StorageService'
import http from '@/services/http/AxiosInstance'

export default class LoginService {
  static login (username, password, formId) {
    return http().post(`form/${formId}/login`, {
      respondentAssignedId: username,
      password: password
    }).then(res => {
      if (res.status >= 200 && res.status < 400) {
        storage.set('interview-id', res.data.interviewId) // TODO: Do this differently probably
        return res
      } else {
        throw Error('Unable to log in to this form with the provided credentials')
      }
    }).catch(() => {
      this.error = 'Unable to login at this time'
    })
  }
  static isLoggedIn () {
    return storage.get('interview-id', 'string') !== null
  }
}
