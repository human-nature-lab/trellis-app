import axios, { AxiosInstance } from 'axios'
import config from 'config'
import RouteWhitelist from '../../router/RouteWhitelist'
import storage from '../StorageService'
import router, { routerReady } from '../../router'
import singleton from '../../static/singleton'
import DatabaseService from '../database/DatabaseService'
import DeviceService from '../device/DeviceService'
import { makeBasicAuthHeader } from '../util'

export interface Token {
  hash: string
  name: string
}

const TOKEN_KEY = 'x-token'
let defaultInst, syncInst

/**
 * Set the token value. This stores it in local storage as well
 * @param {Token} token - The token value
 */
export function setToken (token: Token) {
  storage.set(TOKEN_KEY, token)
}

export function getToken () {
  return storage.get(TOKEN_KEY)
}

export function removeToken () {
  storage.delete(TOKEN_KEY)
}

function requestInterceptor (request) {
  const token = storage.get(TOKEN_KEY)
  if (token && token.hash) {
    request.headers['X-Token'] = token.hash
  }
  return request
}

function responseInterceptor (response) {
  if (response.status === 401) {
    return Promise.reject('Not logged in')
  }
  return response
}

async function responseError (err) {
  if (err.response && err.response.status === 401) {
    await routerReady()
    let nextRoute = router.history.pending ? router.history.pending.fullPath : router.currentRoute.fullPath
    singleton.loading.active = false
    if (RouteWhitelist.indexOf(router.currentRoute.name) === -1) {
      router.replace({name: 'Login', query: {to: nextRoute}})
    }
    return Promise.reject(err.response)
  }
  return Promise.reject(err)
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
    defaultInst.interceptors.request.use(requestInterceptor)
    defaultInst.interceptors.response.use(responseInterceptor, responseError)
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

export async function syncInstance (): Promise<AxiosInstance> {
  if (syncInst === undefined) {
    const apiRoot = await DatabaseService.getServerIPAddress()
    const deviceKey = await DeviceService.getDeviceKey()
    syncInst = axios.create({
      baseURL: apiRoot + '/sync',
      timeout: 0,
      headers: {
        'X-Key': deviceKey
      }
    })
  }
  return syncInst
}

let syncAuthInterceptor
export async function setSyncCredentials (username: string, password: string) {
  const sync = await syncInstance()
  syncAuthInterceptor = sync.interceptors.request.use(function (config) {
    config.headers['Authorization'] = makeBasicAuthHeader(username, password)
    return config
  })
}

export async function resetSyncCredentials () {
  const sync = await syncInstance()
  sync.interceptors.request.eject(syncAuthInterceptor)
}

export const adminInst = axios.create({
  baseURL: config.apiRoot,
  headers: {'X-Key': config.xKey}
})

adminInst.interceptors.request.use(requestInterceptor)
adminInst.interceptors.response.use(responseInterceptor, responseError)
