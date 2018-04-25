import StudyService from '@/services/study/StudyService'
import storage from '@/services/storage/StorageService'
export default class LocaleService {
  static hasValidLocale () {
    console.log('TODO: Should also check if the current locale is a valid one for the selected study')
    return storage.get('current-locale') !== null
  }
  static getCurrentStudyLocales () {
    let study = StudyService.getCurrentStudy()
    return study.locales
  }
  static setCurrentLocale (locale) {
    storage.set('current-locale', locale)
  }
}
