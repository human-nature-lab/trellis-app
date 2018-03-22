import Survey from '../../../models/Survey'
export default class SurveyState {
  constructor (formBlueprint) {
    this.survey = new Survey(formBlueprint)
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
        this.survey.next()
        break
      case 'previous':
        this.survey.previous()
        break
      case 'select-choice':
        this.survey.getQuestion(action.question_id).select(action.changes_text)
        break
      case 'deselect-choice':
        this.survey.getQuestion(action.question_id).deselect(action.changes_text)
        break
      default:
        console.log('Default')
    }
  }
}
