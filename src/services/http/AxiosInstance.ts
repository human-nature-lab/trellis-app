import axios, { AxiosInstance, AxiosRequestConfig } from 'axios'
import config from 'config'
import RouteWhitelist from '../../router/RouteWhitelist'
import storage from '../StorageService'
import router, { routeQueue, routerReady } from '../../router'
import singleton from '../../static/singleton'
import DatabaseService from '../database/DatabaseService'
import DeviceService from '../device'
import { makeBasicAuthHeader } from '../util'
import { requestCredentials } from '../../components/login/LoginModal.vue'
import { ExpiringValue } from '../../classes/ExpiringValue'

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
    request.headers['Authorization'] = `bearer ${token.hash}`
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
    const axConf: AxiosRequestConfig = {
      baseURL: config.apiRoot + '/survey-view',
      timeout: 120000,
    }
    if (config.xKey) {
      axConf.headers = {'X-Key': config.xKey}
    }
    defaultInst = axios.create(axConf)

    // Handle authentication using axios [interceptors](https://github.com/axios/axios#interceptors)
    defaultInst.interceptors.request.use(requestInterceptor)
    defaultInst.interceptors.response.use(responseInterceptor, responseError)
  }
  return defaultInst
}

export async function heartbeatInstance (apiRoot: string): Promise<AxiosInstance> {
  const axConf: AxiosRequestConfig = {
    baseURL: apiRoot + '/sync',
    timeout: 0,
  }
  if (config.xKey) {
    axConf.headers = {'X-Key': config.xKey}
  }
  return axios.create(axConf)
}

const minuteMs = 60 * 1000
const syncAuthHeader = new ExpiringValue(30 * minuteMs)
export async function syncInstance (): Promise<AxiosInstance> {
  if (syncInst === undefined) {
    const apiRoot = await DatabaseService.getServerIPAddress()
    syncInst = axios.create({
      baseURL: apiRoot + '/sync',
      timeout: 0
    })
    syncInst.interceptors.request.use(async function (config) {
      config.headers['X-Key'] = await DeviceService.getDeviceKey()
      const authHeader = syncAuthHeader.get()
      if (authHeader) {
        config.headers['Authorization'] = authHeader
      }
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
export async function setSyncCredentials (username: string, password: string) {
  const sync = await syncInstance()
  syncAuthHeader.set(makeBasicAuthHeader(username, password))
}

export async function resetSyncCredentials () {
  syncAuthHeader.clear()
}

export async function getSyncAuthentication () {
  return syncAuthHeader.get()
}

export const adminInst = axios.create({
  baseURL: config.apiRoot,
})

adminInst.interceptors.request.use(requestInterceptor)
adminInst.interceptors.response.use(responseInterceptor, responseError)

export const builderInst = axios.create({
  baseURL: config.apiRoot + "/builder",
})
builderInst.interceptors.request.use(requestInterceptor)
builderInst.interceptors.response.use(responseInterceptor, responseError)