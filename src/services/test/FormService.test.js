import MockService from './GeneratorService'
import uuidv4 from 'uuid/v4'
export default class FormService {
  static getStudyForms (studyId) {
    // TODO: Add valid skip conditions
    return MockService.expandPromise({
      id: uuidv4,
      form_master_id: uuidv4,
      version: 1,
      is_published: true,
      sections: MockService.arrayGenerate((i, sections) => ({
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
          follow_up_question_id: MockService.expand(sections.length && Math.random() < 0.333 ? MockService.randomSelect(MockService.randomSelect(MockService.randomSelect(sections).question_groups).questions).id : null)
        }],
        name_translation: MockService.translationGenerator,
        question_groups: MockService.arrayGenerate(i => ({
          id: uuidv4,
          pivot: {
            question_group_order: i
          },
          questions: MockService.arrayGenerate(i => MockService.questionGenerator, 1, 3)
        }), 1, 4),
        skips: []
      }), 1, 4)
    })
  }
}
