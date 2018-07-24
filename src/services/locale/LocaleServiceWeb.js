import StudyService from '../study/StudyService'
import storage from '../storage/StorageService'
import singleton from '../../static/singleton'
import http from '../http/AxiosInstance'
import i18n from '../../i18n'
export default class LocaleService {
  static hasValidLocale () {
    console.log('TODO: Should probably also check if the current locale is a valid one for the selected study')
    LocaleService.setExistingLocale()
    return singleton.locale !== null && singleton.locale !== undefined
  }
  static getCurrentLocale () {
    return storage.get('current-locale')
  }
  static setExistingLocale () {
    let locale = LocaleService.getCurrentLocale()
    singleton.locale = locale
    i18n.locale = locale && i18n.messages[locale.language_tag] ? locale.language_tag : 'en'
  }
  static getStudyLocales (studyId) {
    return StudyService.getStudy(studyId).then(study => study.locales)
  }
  static setCurrentLocale (locale) {
    storage.set('current-locale', locale)
    singleton.locale = locale
    i18n.locale = i18n.messages[locale.language_tag] ? locale.language_tag : 'en'
  }

  /**
   * Get a locale by the localeId
   * @param {string} - localeId
   * @returns {Promise<Object>} - Resolves to the locale or fails
   */
  static getLocaleById (localeId) {
    return http().get(`/locale/${localeId}`).then(res => {
      return res.data.locale
    })
  }
}
