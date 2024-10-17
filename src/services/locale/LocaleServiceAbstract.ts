import StudyLocale from '@/entities/trellis/StudyLocale'
import Locale from '@/entities/trellis/Locale'
import Study from '@/entities/trellis/Study'
import SingletonService, { StorageKey } from '../SingletonService'
import StudyService from '../study'

export abstract class LocaleServiceAbstract {
  async hasValidLocale (): Promise<boolean> {
    const locale = await this.getCurrentLocale()
    return (locale instanceof Locale)
  }

  async getCurrentLocale (): Promise<Locale | null> {
    const study = StudyService.getCurrentStudy()
    if (study === null) {
      return null
    }
    const locale = SingletonService.get(StorageKey.locale)
    if (locale instanceof Locale && this.isStudyLocale(study, locale)) {
      return locale
    }
    try {
      console.log('Getting default locale')
      const defaultLocale: Locale = await this.getLocaleById(study.defaultLocaleId)
      if (defaultLocale instanceof Locale) {
        this.setCurrentLocale(defaultLocale)
        return defaultLocale
      }
    } catch (err) { /* Unable to get the study's default locale */
    }
    return null
  }

  async isStudyLocale (study: Study, locale: Locale) {
    const studyLocales = await this.getStudyLocales(study.id)
    for (let i = 0; i < studyLocales.length; i++) {
      if (locale.id === studyLocales[i].id) {
        return true
      }
    }
    return false
  }

  setCurrentLocale (locale: Locale): void {
    console.log('setting current locale', locale)
    SingletonService.setCurrentLocale(locale)
  }

  abstract getStudyLocales(studyId: string): PromiseLike<Locale[]>

  abstract getLocaleById(localeId: string): PromiseLike<Locale>

  abstract getAllLocales(): PromiseLike<Locale[]>

  abstract addStudyLocale(studyId: string, locale: Locale): PromiseLike<StudyLocale>

  abstract removeStudyLocale(studyId: string, locale: Locale): PromiseLike<void>
}
