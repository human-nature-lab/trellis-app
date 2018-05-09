import StudyService from '@/services/study/StudyService'
import storage from '@/services/storage/StorageService'
import singleton from '@/singleton'
export default class LocaleService {
  static hasValidLocale () {
    console.log('TODO: Should probably also check if the current locale is a valid one for the selected study')
    LocaleService.setExistingLocale()
    return singleton.locale !== null && singleton.locale !== undefined
  }
  static getCurrentLocale () {
    return storage.get('current-locale', 'object')
  }
  static setExistingLocale () {
    singleton.locale = LocaleService.getCurrentLocale()
  }
  static getCurrentStudyLocales () {
    return StudyService.getCurrentStudy().then(study => study.locales)
  }
  static setCurrentLocale (locale) {
    storage.set('current-locale', locale)
    singleton.locale = locale
  }
}
