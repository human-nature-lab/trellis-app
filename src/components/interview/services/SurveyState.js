import interviewNavigator from './InterviewNavigator'
import dataStore from './InterviewDataStore'
import interpolationService from '@/services/InterpolationService'
import translationService from '@/services/TranslationService'
// import interviewActions from './InterviewActionDefinitions'
export default class SurveyState {
  constructor () {
    this.navigator = interviewNavigator
    this.dataStore = dataStore
    // TODO: Why does this break Vue's reactivity? Probably because I'm overiding an existing method without inheritance?
    // this.navigator.hasConditionTag = conditionId => {
    //   return this.dataStore.hasConditionTag(conditionId, this.navigator.state.section) // TODO: Make this use the correct state variables
    // }
    this._currentQuestions = {} // Cached reference to the current questions
  }

  loadBlueprint (blueprint) {
    this.navigator.loadStructure(blueprint)
  }

  // Handle merging data from the data store with the question blueprints from the navigator
  _combineQuestionData (questionBlueprints, questionData) {
    return questionBlueprints.map(blueprint => {
      let question = {
        id: blueprint.id,
        choices: Object.assign(blueprint.choices, {}),
        type: blueprint.question_type,
        data: questionData[blueprint.id] ? questionData[blueprint.id].data : []
      }
      if (question.choices) {
        question.choices.forEach(choice => (choice.text = interpolationService.interpolate(translationService.getTranslated(choice.choice_translation))), {})
      }
      question.name = blueprint.var_name
      question.text = interpolationService.interpolate(question.text, {})
      return question
    })
  }

  getQuestion (questionId) {
    return this._currentQuestions.find(question => question.id === questionId)
  }

  getCurrentQuestions () {
    let questionData = this.dataStore.getPageQuestionData(this.navigator.state.section, this.navigator.state.page)
    let questionBlueprints = this.navigator.getCurrentQuestionBlueprints()
    console.log(questionData, questionBlueprints)
    this._currentQuestions = this._combineQuestionData(questionBlueprints, questionData)
    return this._currentQuestions
  }

  /**
   * Play an array of actions in order
   * @param {Array} actions
   */
  playActions (actions) {
    for (let action of actions) {
      this.doAction(action)
    }
  }

  /**
   * All actions should flow through here and be interpreted in the same way. New user actions and previous user actions
   * should follow the same pipeline so that it is impossible to reach an inconsistent or different state with the same
   * actions. (Preload actions will also flow through this method)
   * @param {object} action - An object representing a single action
   */
  doAction (action) {
    console.log(action)
    switch (action.action_type) {
      case 'next':
        this.navigator.next()
        break
      case 'previous':
        this.navigator.previous()
        break
      case 'select-choice':
        this.getQuestion(action.question_id).select(action.changes_text)
        break
      case 'deselect-choice':
        this.getQuestion(action.question_id).deselect(action.changes_text)
        break
      default:
        console.log('Default')
    }
  }
}
