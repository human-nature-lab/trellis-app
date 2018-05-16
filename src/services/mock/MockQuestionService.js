import faker from 'faker'     // https://github.com/marak/Faker.js/
import _ from 'lodash'        // https://lodash.com/
import GeneratorService from './GeneratorService'
import MockService from './MockService'

const baseGenerator = {
  var_name: faker.hacker.noun,
  question_translation: () => ({
    translation_text: () => MockService.locales.map(locale => ({
      locale_id: locale.id,
      locale: locale,
      translated_text: faker.lorem.lines
    }))
  }),
  datum: {
    id: 1,
    dk_rf: null,
    dk_rf_val: null,
    data: []
  }
}

const choiceTranslationGenerator = {
  translation_text: () => MockService.locales.map(locale => ({
    locale_id: locale.id,
    locale: locale,
    translated_text: faker.lorem.lines
  }))
}

// Types: intro, integer, decimal, multiple_select, multiple_choice
// JSON Schema faker definitions for specific question types
let questionGenerator = {
  multiple_select: {
    choices: () => GeneratorService.arrayGenerate(i => ({
      value: faker.lorem.word,
      choice_translation: _.cloneDeep(choiceTranslationGenerator)
    }), 2, 20)
  },
  relationship: {
    datum: {
      data: [{
        edge_id: 1
      }, {
        edge_id: 2
      }]
    }
  }
}

questionGenerator['multiple_choice'] = questionGenerator.multiple_select

export default class MockQuestionService {
  static get (type) {
    let generator = _.cloneDeep(baseGenerator)
    if (questionGenerator[type]) {
      generator = _.merge(generator, _.cloneDeep(questionGenerator[type]))
    }
    return new Promise(resolve => {
      let question = GeneratorService.expand(generator)
      question.type = {
        name: type
      }
      question.var_name = type
      return resolve(question)
    })
  }
}
