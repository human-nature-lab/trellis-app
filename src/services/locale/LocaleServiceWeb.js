import StudyService from '@/services/study/StudyService'
import storage from '@/services/storage/StorageService'
import singleton from '@/singleton'
import http from '../http/AxiosInstance'
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
    singleton.locale = LocaleService.getCurrentLocale()
  }
  static getStudyLocales (studyId) {
    return StudyService.getStudy(studyId).then(study => study.locales)
  }
  static setCurrentLocale (locale) {
    storage.set('current-locale', locale)
    singleton.locale = locale
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
