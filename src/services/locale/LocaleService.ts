import StudyService from '../study/StudyService'
import storage from '../storage/StorageService'
import singleton from '../../static/singleton'
import http from '../http/AxiosInstance'
import i18n from '../../i18n'
import moment from 'moment'
import Locale from '../../entities/trellis/Locale'

export default class LocaleService {
  /**
   * @returns {boolean} - Returns true if a valid locale has been set
   */
  static hasValidLocale (): boolean {
    console.log('TODO: Should probably also check if the current locale is a valid one for the selected study')
    LocaleService.setExistingLocale()
    return singleton.locale !== null && singleton.locale !== undefined
  }

  /**
   * @returns {Locale} - Returns the currently selected locale
   */
  static getCurrentLocale (): Locale {
    return storage.get('current-locale')
  }

  /**
   * Set i18n based on the currently set locale
   */
  static setExistingLocale (): void {
    let locale = LocaleService.getCurrentLocale()
    singleton.locale = locale
    i18n.locale = locale && i18n.messages[locale.languageTag] ? locale.languageTag : 'en'
  }

  /**
   * Get study locales
   * @param {string} studyId
   * @returns {Promise<Locale[]>} - Returns a promise that resolves to an array of Locales associated with the study
   */
  static async getStudyLocales (studyId: string): Promise<Locale[]> {
    const study = await StudyService.getStudy(studyId)
    const locales = await study.locales
    return locales
  }

  /**
   * Sets the current locale
   * @param {Locale} locale
   */
  static setCurrentLocale (locale: Locale): void {
    moment.locale(locale.languageTag)
    storage.set('current-locale', locale)
    singleton.locale = locale
    i18n.locale = i18n.messages[locale.languageTag] ? locale.languageTag : 'en'
  }

  /**
   * Get a locale by the localeId
   * @param {string} localeId
   * @returns {Promise<Object>} - Resolves to the locale or fails
   */
  static async getLocaleById (localeId: string): Promise<Locale> {
    const res = await http().get(`/locale/${localeId}`)
    return new Locale().fromJSON(res.data.locale)
  }
}
