import { debounce } from 'lodash'
import Action from '../../../entities/trellis/Action'
import actionBus from '../services/actions/ActionBus'
import { ActionPayload } from '../services/actions/ActionPayload'
import { onBeforeUnmount } from 'vue'

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

export function actionWithoutQuestion (type: string, payload?: ActionPayload) {
  const action = new Action()
  action.actionType = type
  action.payload = payload
  return actionBus.action(action)
}

export function useActionHandler (cb: (action: Action) => void) {
  actionBus.on('action', cb)
  onBeforeUnmount(() => actionBus.off('action', cb))
}
