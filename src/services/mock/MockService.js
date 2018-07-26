import faker from 'faker'
import uuidv4 from 'uuid/v4'
import GeneratorService from './GeneratorService'

/**
 * The purpose of this class is to mock up specific data structures relevant to this app. It's distinct
 * from the GeneratorService simply because it is not intended to stand on its own as a useful service.
 * This class also keeps track of fake locales for you
 */
class MockService {
  constructor () {
    this.locales = []
    this.addRandomLocale = this.addRandomLocale.bind(this)
    this.translationGenerator = this.translationGenerator.bind(this)
    this.choiceGenerator = this.choiceGenerator.bind(this)
    this.choicesGenerator = this.choicesGenerator.bind(this)
    this.questionGenerator = this.questionGenerator.bind(this)
    this.expand = GeneratorService.expand.bind(this)
    this.expandPromise = GeneratorService.expandPromise.bind(this)
  }

  /**
   * Add a random locale to this service
   */
  addRandomLocale () {
    let country = faker.address.country()
    this.locales.push({
      id: uuidv4,
      language_name: country,
      language_native: country,
      language_tag: country.substr(0, 2)
    })
  }

  /**
   * Generate a translation for each locale that has been defined in this service
   * @returns {{id: v4, translation_text: {id: v4, locale_id, translated_text: *}[]}}
   */
  translationGenerator () {
    return {
      id: uuidv4,
      translation_text: this.locales.map(locale => ({
        id: uuidv4,
        locale_id: locale.id,
        translated_text: faker.internet.domainWord
      }))
    }
  }

  /**
   * Generate a single choice
   * @param {Number} i - The router of the choice (used for sort order
   * @returns {{id: v4, val: *, pivot: {sort_order: *}, choice_translation: MockService.translationGenerator}}
   */
  choiceGenerator (i) {
    return {
      id: uuidv4,
      val: i,
      pivot: {
        sort_order: i
      },
      choice_translation: this.translationGenerator
    }
  }

  /**
   * Generate a random number of choices between min and max
   * @param {number} [minChoices = 2]
   * @param {number} [maxChoices = 8]
   * @returns {Array}
   */
  choicesGenerator (minChoices = 2, maxChoices = 8) {
    return GeneratorService.arrayGenerate(this.choiceGenerator, minChoices, maxChoices)
  }

  /**
   * Generate a single question
   * @param i
   * @param questions
   * @returns {{} & {var_name: string|number|*, text, question_translation: MockService.translationGenerator, question_type: {id: v4, name: *}}}
   */
  questionGenerator (i, questions) {
    // TODO: Add other question types here
    // TODO: Add valid question parameters here
    // TODO: add valid assign condition tags
    const typeMap = {
      'multi_select': (i, questions) => ({
        choices: this.choicesGenerator(4, 10)
      }),
      'multiple_choice': (i, questions) => ({
        choices: this.choiceGenerator(2, 5)
      })
    }
    const type = GeneratorService.randomSelect(Object.keys(typeMap))
    const baseQuestion = {
      var_name: faker.lorem.word,
      text: faker.lorem.lines,
      question_translation: this.translationGenerator,
      question_type: {
        id: uuidv4,
        name: type
      }
    }
    let rQuestion = Object.assign({}, baseQuestion)
    if (typeMap[type]) {
      rQuestion = Object.assign(rQuestion, typeMap[type](i, questions))
    } else {
      rQuestion.var_name = `question type not mocked: ${type}`
    }
    return rQuestion
  }

  /**
   * Return a promise which will fail with the provided probability and resolve with the provided delay
   * @param {function} cb
   * @param {number} [delay = 2000]
   * @param {number} [failureProbability = 0.5]
   * @returns {Promise<any>}
   */
  randomlyFail (cb, delay = 2000, failureProbability = 0.5) {
    return new Promise(function (resolve, reject) {
      setTimeout(function () {
        if (Math.random() > failureProbability) {
          return cb(resolve, reject)
        } else {
          return reject(new Error('Unable to complete request'))
        }
      }, delay)
    })
  }
}

export default new MockService()
