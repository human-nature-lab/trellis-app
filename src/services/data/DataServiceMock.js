import MockService from '@/services/mock/MockService'
MockService.addRandomLocale()
MockService.addRandomLocale()
export default class DataService {
  static getLocales () {
    // These should probably be somewhere else??? Maybe somewhere were we have test env specific bootstrapping
    return MockService.expandPromise(MockService.locales)
  }
  static getConditions (respondentId, formId, sectionId) {
    return MockService.expandPromise(MockService.arrayGenerate(MockService.generateCondition))
  }
}
