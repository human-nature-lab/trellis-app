import MockService from '@/services/mock/MockService'
import GeneratorService from '@/services/mock/GeneratorService'
import uuidv4 from 'uuid/v4'
import form1 from './forms/form-1.json'
import form2 from './forms/form-2.json'
// import form3Womens from './forms/form-3-womens'
let forms = [form1.form, form2.form]
for (let form of forms) {
  console.log(form.id)
}
export default class FormService {
  static getForm (formId) {
    let form = forms.find(form => form.id === formId)
    if (form) {
      return new Promise(resolve => {
        return resolve(form)
      })
    } else {
      return new Promise(resolve => {
        return resolve({
          sections: [],
          name_translation: {}
        })
      })
    }
  }
  static getStudyForms (studyId) {
    // TODO: Add valid skip conditions
    return MockService.expandPromise({
      id: uuidv4,
      form_master_id: uuidv4,
      version: 1,
      is_published: true,
      sections: GeneratorService.arrayGenerate((i, sections) => ({
        id: uuidv4,
        pivot: {
          sort_order: i,
          is_repeatable: 0,
          max_repetitions: 0
        },
        form_sections: [{
          id: uuidv4,
          sort_order: i,
          is_repeatable: false,
          max_repetitions: 0,
          repeat_prompt_translation: MockService.translationGenerator,
          follow_up_question_id: MockService.expand(sections.length && Math.random() < 0.333 ? GeneratorService.randomSelect(GeneratorService.randomSelect(GeneratorService.randomSelect(sections).question_groups).questions).id : null)
        }],
        name_translation: MockService.translationGenerator,
        question_groups: GeneratorService.arrayGenerate(i => ({
          id: uuidv4,
          pivot: {
            question_group_order: i
          },
          questions: GeneratorService.arrayGenerate(i => MockService.questionGenerator, 1, 3)
        }), 1, 4),
        skips: []
      }), 1, 4)
    })
  }
}
