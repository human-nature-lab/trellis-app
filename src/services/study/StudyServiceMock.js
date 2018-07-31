import MockService from '../mock/MockService'
import storage from '@/services/storage/StorageService'
import singleton from '../../static/singleton'
export default class StudyServiceMock {
  static getCurrentStudy () {
    return MockService.randomlyFail(resolve => {
      return resolve(storage.get('current-study', 'object'))
    }, StudyServiceMock.DELAY, StudyServiceMock.FAILURE_RATE)
  }
  static getStudy (studyId) {
    return MockService.randomlyFail(resolve => {
      return resolve({
        id: studyId,
        name: 'About that',
        photo_quality: 100,
        default_locale_id: MockService.locales[0].id,
        locales: MockService.locales
      })
    }, StudyServiceMock.DELAY, StudyServiceMock.FAILURE_RATE)
  }
  static setCurrentStudy (study) {
    return MockService.randomlyFail(resolve => {
      storage.set(`current-study`, study)
      return resolve({
        msg: 'ok'
      })
    }, StudyServiceMock.DELAY, StudyServiceMock.FAILURE_RATE)
  }
  /**
   * Apply the existing version of the study to the global Vue data store
   */
  static setExistingStudy () {
    if (storage.get('current-study')) {
      singleton.study = storage.get('current-study')
    }
  }
}

StudyServiceMock.FAILURE_RATE = 0.05
StudyServiceMock.DELAY = 500
