import debounce from 'lodash/debounce'
import Emitter from '../../../../classes/Emitter'


class ActionBus extends Emitter {

  /**
   * This function waits 500 ms after the last input before being called. It is particularly helpful for text input
   * questions where we're sending the entirety of the text input with the action
   * @type {Function}
   */
  public actionDebounce = debounce((...args) => this.action(...args), 500)

  /**
   * Helpful alias for emitting an action
   * @param {any} args
   */
  public action (...args: any[]) {
    return this.emit('action', ...args)
  }

}

// A shared event emitter for sharing data between components without a parent child relationship. This one is used for
// emitting and acting on actions exclusively
export default new ActionBus()
