import * as Sentry from '@sentry/browser'
import Emitter from '../classes/Emitter'
import singleton from '../static/singleton'
import storage from './StorageService'
import { loadLanguageAsync } from '../i18n/index'
import DeviceService from './device'
import DatabaseService from './database'
import config from '../config'
import { APP_ENV } from '../static/constants'
import theme from '../static/theme'
import { setLocale } from './DateService'
import Locale from '@/entities/trellis/Locale'

export enum StorageKey {
  theme = 'dark-theme',
  study = 'study',
  locale = 'locale',
  offline = 'offline',
  user = 'user',
}

export enum SingletonEvent {
  study = 'study',
  locale = 'locale',
  darkTheme = 'dark-theme',
  offline = 'offline',
  user = 'user',
}

class SingletonService extends Emitter {
  loadPromise: Promise<void>

  constructor () {
    super()
    this.loadPromise = this.loadFromLocalStorage()
  }

  hasLoaded () {
    return this.loadPromise
  }

  async loadFromLocalStorage () {
    if (storage.get(StorageKey.theme)) {
      singleton.darkTheme = storage.get(StorageKey.theme)
      theme.dark = singleton.darkTheme
    }
    singleton.deviceId = await DeviceService.getUUID()
    if (config.appEnv === APP_ENV.CORDOVA && config.sentry) {
      const server = await DatabaseService.getServerIPAddress()
      Sentry.configureScope(scope => {
        scope.setTag('server', server)
      })
    }
  }

  setCurrentStudy (study) {
    singleton.study = study
    storage.set(StorageKey.study, study.id)
  }

  setCurrentLocale (locale: Locale) {
    const tag = locale.languageTag
    setLocale(tag)
    loadLanguageAsync(tag)
    singleton.locale = locale
    storage.set(StorageKey.locale, locale.id)
    this.dispatch(SingletonEvent.locale, locale)
  }

  setDarkTheme (useDarkTheme: boolean) {
    singleton.darkTheme = useDarkTheme
    storage.set(StorageKey.theme, useDarkTheme)
    this.dispatch(SingletonEvent.darkTheme, useDarkTheme)
  }

  setOnlineOffline (isOffline) {
    storage.set(StorageKey.offline, isOffline)
    singleton.offline = isOffline
    this.dispatch(SingletonEvent.offline, isOffline)
  }

  get (key: StorageKey) {
    if (singleton.hasOwnProperty(key)) {
      return singleton[key]
    }
    if (storage.get(key)) {
      singleton[key] = storage.get(key)
      return singleton[key]
    }
    return null
  }

  set (key: StorageKey, value) {
    singleton[key] = value
    storage.set(key, value)
    this.dispatch(key, value)
  }
}

export default new SingletonService()
