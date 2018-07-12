import axios from 'axios'
import config from '@/config'
import storage from '../../services/storage/StorageService'
import router from '../../router'
import singleton from '../../static/singleton'

let axiosInstance

/**
 * Set the token value. This stores it in local storage as well
 * @param {String} val - The token value
 */
export function setToken (val) {
  storage.set('x-token', val)
}

/**
 * Create the default axios instance. Any authentication for the web app should probably be handled here if possible
 * @returns {Promise<any>}
 */
export default function defaultInstance () {
  if (!axiosInstance) {
    axiosInstance = axios.create({
      baseURL: config.apiRoot + '/survey-view',
      timeout: 20000,
      headers: {'X-Key': config.xKey}
    })

    // Handle authentication using axios [interceptors](https://github.com/axios/axios#interceptors)
    axiosInstance.interceptors.request.use(function (request) {
      request.headers['X-Token'] = storage.get('x-token')
      return request
    })
    axiosInstance.interceptors.response.use(function (response) {
      return response
    }, function (err) {
      if (err.response && err.response.status === 401) {
        let nextRoute = router.history.pending ? router.history.pending.fullPath : router.currentRoute.fullPath
        singleton.loading.active = false
        if (router.currentRoute.name === 'login') {
          return err.response
        } else {
          router.replace({name: 'Login', query: {to: nextRoute}})
          return Promise.resolve(err.response)
        }
      }
      return Promise.reject(err)
    })
  }
  return axiosInstance
}

export const syncInstance = axios.create({
  baseURL: config.apiRoot + '/sync',
  timeout: 0
})
