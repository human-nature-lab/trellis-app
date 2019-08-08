import actionBus from '../services/actions/ActionBus'
import Action from '../../../entities/trellis/Action'
import { ActionPayload } from '../services/actions/DatumOperations'
import Vue from 'vue'
import debounce from 'lodash/debounce'

export default Vue.extend({
  methods: {
    /**
     * Create and emit an action of type with payload
     * @param {string} type
     * @param [payload]
     */
    action (type: string, payload?: ActionPayload) {
      if (!this['question'] || !this['question'].id) {
        throw new Error('Unable to use action method without defining the question. Use actionWithoutQuestion instead.')
      }
      let action = new Action()
      action.actionType = type
      action.questionId = this['question'].id
      action.payload = payload
      return actionBus.action(action)
    },

    /**
     * Create an action with a debounce. Same as above.
     */
    debouncedAction: debounce(function (this: Vue) {
      return this['action'].apply(this, arguments)
    }, 300),

    /**
     * Create and emit an action without a questionId
     * @param {string} type
     * @param payload
     */
    actionWithoutQuestion (type: string, payload?: any) {
      let action = new Action()
      action.actionType = type
      action.payload = payload
      return actionBus.action(action)
    }
  }
})
