import actionBus from '../services/actions/ActionBus'
import Action from '../../../entities/trellis/Action'
import uuidv4 from 'uuid/v4'
export default {
  methods: {
    /**
     * Create and emit an action of type with payload
     * @param {string} type
     * @param [payload]
     */
    action (type: string, payload?: any) {
      if (!this['question'] || !this['question'].id) {
        throw new Error('Unable to use action method without defining the question. Use actionWithoutQuestion instead.')
      }
      let action = new Action()
      action.id = uuidv4()
      action.actionType = type
      action.questionId = this['question'].id
      action.payload = payload
      actionBus.action(action)
    },

    /**
     * Create and emit an action without a questionId
     * @param {string} type
     * @param payload
     */
    actionWithoutQuestion (type: string, payload?: any) {
      let action = new Action()
      action.id = uuidv4()
      action.actionType = type
      action.payload = payload
      actionBus.action(action)
    }
  }
}
