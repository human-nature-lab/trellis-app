import axios, { AxiosInstance, AxiosRequestConfig } from 'axios'
import config from 'config'
import RouteWhitelist from '../../router/RouteWhitelist'
import storage from '../StorageService'
import router, { routeQueue, routerReady } from '../../router'
import singleton from '../../static/singleton'
import DatabaseService from '../database/DatabaseService'
import DeviceService from '../device/DeviceService'
import { makeBasicAuthHeader } from '../util'
import { requestCredentials } from '../../components/login/LoginModal'

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
    singleton.loading.active = false
    if (RouteWhitelist.indexOf(router.currentRoute.name) === -1) {
      routeQueue.replaceAndReturnToCurrent({ name: 'Login' })
    }
    return Promise.reject(err)
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
    syncInst = axios.create({
      baseURL: apiRoot + '/sync',
      timeout: 0
    })
    syncInst.interceptors.request.use(async function (config) {
      config.headers['X-Key'] = await DeviceService.getDeviceKey()
      return config
    })
    syncInst.interceptors.response.use(null, async function (err) {
      console.error(err)
      if (err.response && err.response.status === 401) {
        const config = err.config as AxiosRequestConfig
        const creds = await requestCredentials()
        config.headers['Authorization'] = makeBasicAuthHeader(creds.username, creds.password)
        setSyncCredentials(creds.username, creds.password)
        return syncInst(config)
      } else {
        throw err
      }
    })
  }
  return syncInst
}

let syncAuthInterceptor
let syncAuthHeader: string | null
export async function setSyncCredentials (username: string, password: string) {
  const sync = await syncInstance()
  syncAuthHeader = makeBasicAuthHeader(username, password)
  syncAuthInterceptor = sync.interceptors.request.use(function (config) {
    if (syncAuthHeader) {
      config.headers['Authorization'] = syncAuthHeader
    }
    return config
  })
}

export async function resetSyncCredentials () {
  syncAuthHeader = null
}

export async function getSyncAuthentication () {
  return syncAuthHeader
}

export const adminInst = axios.create({
  baseURL: config.apiRoot,
  headers: { 'X-Key': config.xKey }
})

adminInst.interceptors.request.use(requestInterceptor)
adminInst.interceptors.response.use(responseInterceptor, responseError)
