import Vue from 'vue'
import { debounce } from 'lodash'
import { action } from '../lib/action'
import Action from '../../../entities/trellis/Action'
import actionBus from '../services/actions/ActionBus'

export default Vue.extend({
  methods: {
    /**
     * Create and emit an action of type with payload
     * @param {string} type
     * @param [payload]
     */
    action (type: string, payload?: any) {
      return action(this['question'].id, type, payload)
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
