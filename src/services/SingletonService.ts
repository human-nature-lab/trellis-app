import singleton from '../static/singleton'
import storage from './StorageService'
import LocaleService from './locale/LocaleService'
import StudyService from './study/StudyService'
import i18n from '../i18n'
import moment from 'moment'

enum StorageKey {
  theme = 'dark-theme',
  study = 'current-study',
  locale = 'current-locale',
  offline = 'offline'
}

class SingletonService {
  loadPromise: Promise<void>

  constructor () {
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
  }

  setDarkTheme (useDarkTheme) {
    singleton.darkTheme = useDarkTheme
    storage.set(StorageKey.theme, useDarkTheme)
  }

  setOnlineOffline (isOffline) {
    storage.set(StorageKey.offline, isOffline)
    singleton.offline = isOffline
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
  }
}

export default new SingletonService()
