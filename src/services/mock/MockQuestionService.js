import faker from 'faker'     // https://github.com/marak/Faker.js/
import _ from 'lodash'        // https://lodash.com/
import MockService from './GeneratorService'

const baseGenerator = {
  var_name: faker.hacker.noun,
  text: faker.lorem.lines,
  datum: {
    id: 1,
    dk_rf: null,
    dk_rf_val: null,
    data: []
  }
}

const choiceTranslationGenerator = {
  translation_text: () => [0, 1].map(v => ({
    locale_id: '4a1d88ab-84d4-11e5-ba05-0800279114ca',
    translated_text: faker.lorem.lines
  }))
}

// Types: intro, integer, decimal, multiple_select, multiple_choice
// JSON Schema faker definitions for specific question types
const questionGenerator = {
  multiple_select: {
    choices: () => MockService.arrayGenerate(i => ({
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

questionGenerator.mutliple_choice = questionGenerator.multiple_select

export default class MockQuestionService {
  static get (type) {
    let generator = _.cloneDeep(baseGenerator)
    if (questionGenerator[type]) {
      generator = _.merge(generator, _.cloneDeep(questionGenerator[type]))
    }
    return new Promise(resolve => {
      let question = MockService.expand(generator)
      question.type = {
        name: type
      }
      question.var_name = type
      return resolve(question)
    })
  }
}
