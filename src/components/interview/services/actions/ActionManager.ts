import QuestionDatum from "../../../../entities/trellis/QuestionDatum";
import Action from "../../../../entities/trellis/Action";

export interface ActionHandler {
  (interview: any, payload?: any, questionDatum?: QuestionDatum, questionBlueprint?: any)
}

/**
 * Just allow for registering and performing actions. Only one handler per action
 */
export class ActionManager {
  private actions = {}

  /**
   * Add an action to the action manager
   * @param {string} name
   * @param {ActionManager} cb
   * @returns {ActionManager}
   */
  add (name: string, cb: ActionHandler) {
    if (this.actions[name]) throw Error('A handler for this action has already been registered')
    this.actions[name] = cb
    return this
  }

  /**
   * Perform an action
   * @param {string} name
   * @param {Action} action
   * @param {QuestionDatum} questionDatum
   * @param {object} questionBlueprint
   * @param {boolean} actionWasInitiatedByAHuman
   * @returns {ActionManager}
   */
  do (action: Action, interview: any, questionDatum: QuestionDatum, questionBlueprint: any, actionWasInitiatedByAHuman: boolean) {
    let type = action.actionType
    if (this.actions[type]) {
      return this.actions[type](interview, action.payload, questionDatum, questionBlueprint, actionWasInitiatedByAHuman)
    } else {
      console.error('No handler has been added for action:', type)
    }
    return this
  }
}

export default new ActionManager()
