import SingletonService from '../singleton/SingletonService'
import i18n from '../../i18n'
import moment from 'moment'
import Locale from '../../entities/trellis/Locale'
import Study from '../../entities/trellis/Study'
import StudyService from '../study/StudyService'

export default abstract class LocaleServiceAbstract {
  /**
   * @returns {boolean} - Returns true if the LocaleService can determine a valid locale
   */
   async hasValidLocale (): Promise<boolean> {
    const locale = await this.getCurrentLocale()
    return (locale instanceof Locale)
  }

  /**
   * @returns {Locale} - Returns the currently selected locale,
   * the study's default locale, or null if no study is selected
   */
  async getCurrentLocale (): Promise<Locale|null> {
    const study = StudyService.getCurrentStudy()
    if (study === null) {
      return null
    }
    const locale = SingletonService.get('locale')
    if (locale instanceof Locale && this.isStudyLocale(study, locale)) {
      return locale
    }
    try {
      const defaultLocale: Locale = await this.getLocaleById(study.defaultLocaleId)
      if (defaultLocale instanceof Locale) {
        this.setCurrentLocale(defaultLocale)
        return defaultLocale
      }
    } catch (err) { /* Unable to get the study's default locale */ }
    return null
  }

  /**
   * Returns true if the locale is assigned to the study and false if not
   * @param {Study} study
   * @param {Locale} locale
   */
  async isStudyLocale (study: Study, locale: Locale) {
    const studyLocales = await this.getStudyLocales(study.id)
    for (let i = 0; i < studyLocales.length; i++) {
      if (locale.id === studyLocales[i].id) {
        return true
      }
    }
    return false
  }

  /**
   * Sets the current locale
   * @param {Locale} locale
   */
  setCurrentLocale (locale: Locale): void {
    moment.locale(locale.languageTag)
    i18n.locale = i18n.messages[locale.languageTag] ? locale.languageTag : 'en'
    SingletonService.setCurrentLocale(locale)
  }

  /**
   * Get study locales
   * @param {string} studyId
   * @returns {Promise<Locale[]>} - Returns a promise that resolves to an array of Locales associated with the study
   */
  abstract async getStudyLocales (studyId: string): Promise<Locale[]>

  /**
   * Get a locale by the localeId
   * @param {string} localeId
   * @returns {Promise<Object>} - Resolves to the locale or fails
   */
  abstract async getLocaleById (localeId: string): Promise<Locale>
}
