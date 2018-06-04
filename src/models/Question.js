import translationService from '../services/TranslationService'
import interpolationService from '../services/StringInterpolationService'
export default class Question {
  constructor (blueprint, data = [], conditionTags = [], respondentConditionTags = []) {
    this.blueprint = blueprint
    this.id = blueprint.id
    this.var_name = blueprint.var_name
    this.type = blueprint.question_type
    this.data = data
    this.conditionTags = conditionTags
    this.respondentConditionTags = respondentConditionTags
    this.isAnswered = false
    this.text = interpolationService.interpolate(translationService.getText(this.blueprint.question_translation), {'fake': 'keypairs'})
    if (this.type.name === 'multiple_choice' || this.type.name === 'multiple_select') {
      this._formatChoices()
    }
  }
  _formatChoices () {
    this.choices = this.blueprint.choices.map(choice => {
      choice.text = translationService.getText(choice.choice_translation)
      return choice
    })
    this.choices.sort(function (a, b) {
      return a.pivot.sort_order > b.pivot.sort_order
    })
    this.choices.forEach(function (choice) {
      console.log(choice)
    })
  }
  select (payload) {
    if (!this.choices || !this.choices.length) throw Error('This question does not have any choices to select')
    let choice = this.choices.find(c => c.id === payload.choiceId)
    if (!choice) throw Error('That choice id is not present')
    this.data.push(choice.val)
  }
  deselect (payload) {
    if (!this.choices || !this.choices.length) throw Error('This question does not have any choices to select')
    let choice = this.choices.find(c => c.id === payload.choiceId)
    if (!choice) throw Error('That choice id is not present')
    let dataIndex = this.data.indexOf(choice.val)
    this.data.splice(dataIndex, 1)
  }
}
