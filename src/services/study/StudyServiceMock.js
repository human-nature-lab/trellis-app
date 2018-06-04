import MockService from '../mock/MockService'
import storage from '@/services/storage/StorageService'
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
}

StudyServiceMock.FAILURE_RATE = 0.05
StudyServiceMock.DELAY = 500
