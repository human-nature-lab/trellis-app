import Vue from 'vue'
import _ from 'lodash'
// A shared event emitter for sharing data between components without a parent child relationship. This one is used for
// emitting and acting on actions exclusively
export const actionBus = new Vue()

/**
 * Helpful alias for emitting an action
 * @param {any} args
 */
actionBus.action = function (...args) {
  actionBus.$emit('action', ...args)
}

/**
 * This function waits 500 ms after the last input before being called. It is particularly helpful for text input
 * questions where we're sending the entirety of the text input with the action
 * @type {Function}
 */
actionBus.actionDebounce = _.debounce(function (...args) {
  actionBus.action(...args)
}, 500)
export default actionBus
