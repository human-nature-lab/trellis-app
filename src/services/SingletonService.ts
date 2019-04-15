import * as Sentry from "@sentry/browser";
import Emitter from "../classes/Emitter";
import singleton from '../static/singleton'
import storage from './StorageService'
import LocaleService from './locale/LocaleService'
import StudyService from './study/StudyService'
import i18n from '../i18n/index'
import moment from 'moment'
import DeviceService from "./device/DeviceService"
import DatabaseService from './database/DatabaseService'
import config from 'config'
import {APP_ENV} from '../static/constants'

enum StorageKey {
  theme = 'dark-theme',
  study = 'current-study',
  locale = 'current-locale',
  offline = 'offline'
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
    }
    if (storage.get(StorageKey.study)) {
      const studyId = storage.get(StorageKey.study)
      if (!studyId) return
      singleton.study = await StudyService.getStudy(studyId)
      this.dispatch('study', singleton.study)
    }
    if (storage.get(StorageKey.locale)) {
      const localeId = storage.get(StorageKey.locale)
      if (!localeId) return
      const locale = await LocaleService.getLocaleById(localeId)
      if (locale) {
        this.setCurrentLocale(locale)
      }
      console.log('loaded locale', singleton.locale)
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

  setCurrentLocale (locale) {
    moment.locale(locale.languageTag)
    i18n.locale = i18n.messages[locale.languageTag] ? locale.languageTag : 'en'
    singleton.locale = locale
    storage.set(StorageKey.locale, locale.id)
    this.dispatch('locale', locale)
  }

  setDarkTheme (useDarkTheme) {
    singleton.darkTheme = useDarkTheme
    storage.set(StorageKey.theme, useDarkTheme)
    this.dispatch('dark-theme', useDarkTheme)
  }

  setOnlineOffline (isOffline) {
    storage.set(StorageKey.offline, isOffline)
    singleton.offline = isOffline
    this.dispatch('offline', isOffline)
  }

  get (key) {
    if (singleton.hasOwnProperty(key)) {
      return singleton[key]
    }
    if (storage.get(key)) {
      singleton[key] = storage.get(key)
      return singleton[key]
    }
    return null
  }

  set (key, value) {
    singleton[key] = value
    storage.set(key, value)
    this.dispatch(key, value)
  }
}

export default new SingletonService()
