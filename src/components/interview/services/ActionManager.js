import Emitter from '../../../classes/Emitter'
export default class ActionManager extends Emitter {
  constructor (interviewId, actions = []) {
    super()
    this.interviewId = interviewId
    this.actions = []
  }
  /**
   * Push a user action onto the stack. This will do a diff of the surveyState before actually modifying the data
   * @param questionId
   * @param type
   * @param modifications
   */
  pushUserAction (questionId, type, modifications) {
    let action = {
      interview_id: this.interviewId,
      question_id: questionId,
      action_type: type,
      changes_text: modifications,
      created_at: (new Date()).getTime()
    }
    this.actions.push(action)
    this.dispatch('user-action', action)
  }
  /**
   * Push a non-user action onto the action stack
   * @param questionId
   * @param type
   * @param modifications
   */
  pushAction (action) {
    this.actions.push(action)
    this.dispatch('action', action)
  }
}

let sharedManager = null
export function sharedActionManager (interviewId, actions) {
  if (!sharedManager) {
    sharedManager = new ActionManager(interviewId, actions)
  }
  return sharedManager
}
