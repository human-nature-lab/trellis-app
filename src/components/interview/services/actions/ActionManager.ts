import QuestionDatum from '../../../../entities/trellis/QuestionDatum'
import Action from '../../../../entities/trellis/Action'
import InterviewManager from "../../classes/InterviewManager";
import {ActionPayload} from "./DatumOperations";
import Question from "../../../../entities/trellis/Question";

export interface ActionHandler {
  (interview: InterviewManager,
   action: Action,
   questionDatum?: QuestionDatum,
   questionBlueprint?: Question,
   actionWasInitiatedByHuman?: boolean)
}

/**
 * Just allow for registering and performing actions. Only one handler per action
 */
export class ActionManager {
  private actions: {[key: string]: ActionHandler} = {}

  /**
   * Add an action to the action manager
   * @param {string} name
   * @param {ActionHandler} cb
   * @returns {this}
   */
  add (name: string, cb: ActionHandler) {
    if (this.actions[name]) throw Error('A handler for this action has already been registered')
    this.actions[name] = cb
    return this
  }

  /**
   * Perform an action
   * @param {Action} action
   * @param {InterviewManager} interview
   * @param {QuestionDatum} questionDatum
   * @param {Question} questionBlueprint
   * @param {boolean} actionWasInitiatedByAHuman
   * @returns {any}
   */
  do (action: Action, interview: InterviewManager, questionDatum: QuestionDatum, questionBlueprint: Question, actionWasInitiatedByAHuman: boolean) {
    let type = action.actionType
    if (this.actions[type]) {
      return this.actions[type](interview, action, questionDatum, questionBlueprint, actionWasInitiatedByAHuman)
    } else {
      console.error('No handler has been added for action:', type)
    }
    return this
  }
}

export default new ActionManager()
