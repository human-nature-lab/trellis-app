import singleton from '../../static/singleton'
import storage from '../storage/StorageService'
import LocaleService from '../locale/LocaleService'
import StudyService from '../study/StudyService'

class SingletonService {
  loadPromise: Promise<void>

  constructor () {
    this.loadPromise = this.loadFromLocalStorage()
  }

  async hasLoaded () {
    return this.loadPromise
  }

  async loadFromLocalStorage () {
    if (storage.get('dark-theme')) {
      singleton.darkTheme = storage.get('dark-theme')
    }
    if (storage.get('current-study')) {
      const studyId = storage.get('current-study')
      singleton.study = await StudyService.getStudy(studyId)
    }
    if (storage.get('current-locale')) {
      const localeId = storage.get('current-locale')
      singleton.locale = await LocaleService.getLocaleById(localeId)
    }
    console.debug('loadFromLocalStorage', singleton)
  }

  setCurrentStudy (study) {
    singleton.study = study
    storage.set('current-study', study.id)
  }

  setCurrentLocale (locale) {
    singleton.locale = locale
    storage.set('current-locale', locale.id)
  }

  setDarkTheme (useDarkTheme) {
    singleton.darkTheme = useDarkTheme
    storage.set('dark-theme', useDarkTheme)
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
}

export default new SingletonService()