import config from '../config'
import { APP_ENV, APP_MODE } from '../static/constants'
import storage from './StorageService'

const isOffline = config.appEnv === APP_ENV.CORDOVA && (storage.get('offline') !== null ? storage.get('offline') : true)
console.log(`App is in ${isOffline ? 'offline' : 'online'} mode`)
/* global cordova */
export function switchByModeEnv (args) {
  if (isOffline) {
    if (config.appMode === APP_MODE.PROD) {
      return args.CORDOVA && args.CORDOVA.PROD ? args.CORDOVA.PROD : args.CORDOVA
    } else {
      return args.CORDOVA && args.CORDOVA.TEST ? args.CORDOVA.TEST : args.CORDOVA
    }
  } else {
    if (config.appMode === APP_MODE.PROD) {
      return args.WEB && args.WEB.PROD ? args.WEB.PROD : args.WEB
    } else {
      return args.WEB && args.WEB.TEST ? args.WEB.TEST : args.WEB
    }
  }
}

export function makeBasicAuthHeader (username, password) {
  return 'Basic ' + btoa(`${username}:${password}`)
}

export function isUndefined (val: any): boolean {
  return val === null || val === undefined
}

export default switchByModeEnv
