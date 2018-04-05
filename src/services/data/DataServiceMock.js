import MockService from '@/services/mock/MockService'
import form1 from '@/services/form/forms/form-1'
export default class DataService {
  static getLocales () {
    if (!MockService.locales.length) {
      let locales = form1.form.name_translation.translation_text.map(t => {
        return t.locale
      })
      MockService.locales = MockService.locales.concat(locales)
    }
    // These should probably be somewhere else??? Maybe somewhere were we have test env specific bootstrapping
    return new Promise(resolve => {
      resolve(MockService.locales)
    })
  }
  static getConditions (respondentId, formId, sectionId) {
    return MockService.expandPromise(MockService.arrayGenerate(MockService.generateCondition))
  }
}
