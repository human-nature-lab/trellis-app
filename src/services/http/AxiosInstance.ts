import axios, {AxiosInstance} from 'axios'
import config from '../../config'
import storage from '../StorageService'
import router from '../../router'
import singleton from '../../static/singleton'
import DatabaseService from '../database/DatabaseService'

const TOKEN_KEY = 'x-token'
let defaultInst, syncInst

/**
 * Set the token value. This stores it in local storage as well
 * @param {String} val - The token value
 */
export function setToken (val) {
  storage.set(TOKEN_KEY, val)
}

export function removeToken () {
  storage.delete(TOKEN_KEY)
}

/**
 * Create the default axios instance. Any authentication for the web app should probably be handled here if possible
 * @returns {Axios}
 */
export default function defaultInstance (): AxiosInstance {
  if (!defaultInst) {
    defaultInst = axios.create({
      baseURL: config.apiRoot + '/survey-view',
      timeout: 120000,
      headers: {'X-Key': config.xKey}
    })

    // Handle authentication using axios [interceptors](https://github.com/axios/axios#interceptors)
    defaultInst.interceptors.request.use(function (request) {
      request.headers['X-Token'] = storage.get(TOKEN_KEY)
      return request
    })
    defaultInst.interceptors.response.use(function (response) {
      if (response.status === 401) {
        return Promise.reject('Not logged in')
      }
      return response
    }, function (err) {
      if (err.response && err.response.status === 401) {
        let nextRoute = router.history.pending ? router.history.pending.fullPath : router.currentRoute.fullPath
        singleton.loading.active = false
        if (router.currentRoute.name === 'login') {
          return Promise.reject(err.response)
        } else {
          router.replace({name: 'Login', query: {to: nextRoute}})
          return Promise.resolve(err.response)
        }
      }
      return Promise.reject(err)
    })
  }
  return defaultInst
}

export async function heartbeatInstance (apiRoot: string): Promise<AxiosInstance> {
  return axios.create({
    baseURL: apiRoot + '/sync',
    timeout: 0,
    headers: {'X-Key': config.xKey}
  })
}

export async function syncInstance (): Promise<AxiosInstance>  {
  if (syncInst === undefined) {
    const apiRoot = await DatabaseService.getServerIPAddress()
    syncInst = axios.create({
      baseURL: apiRoot + '/sync',
      timeout: 0,
      headers: {'X-Key': config.xKey}
    })
  }
  return syncInst
}
