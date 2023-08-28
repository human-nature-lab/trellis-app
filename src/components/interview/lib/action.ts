import { debounce } from 'lodash'
import Action from '../../../entities/trellis/Action'
import actionBus from '../services/actions/ActionBus'
import { ActionPayload } from '../services/actions/ActionPayload'

export function action (questionId: string, type: string, payload?: ActionPayload) {
  if (!questionId) {
    throw new Error('Unable to use action method without defining the question. Use actionWithoutQuestion instead.')
  }
  const action = new Action()
  action.actionType = type
  action.questionId = questionId
  action.payload = payload
  return actionBus.action(action)
}

export const debouncedAction = debounce(action, 300)
