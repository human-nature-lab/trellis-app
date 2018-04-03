export default class Emitter {
  constructor () {
    this.eventCallbacks = {}
  }

  /**
   * Register an event type by name. This method is called when the 'on' method is called if an event of that type has
   * not been registered yet.
   * @param eventName
   */
  register (eventName) {
    if (this.eventCallbacks[eventName]) {
      throw Error('An event with this name has already been registered', eventName)
    }
    this.eventCallbacks[eventName] = []
  }

  /**
   * Add an event callback with optional context
   * @param eventName
   * @param callback
   * @param context
   */
  on (eventName, callback, context = null) {
    if (!this.eventCallbacks[eventName]) {
      this.register(eventName)
    }
    this.eventCallbacks[eventName].unshift({
      callback: callback,
      context: context
    })
  }

  /**
   * Remove an event callback by reference
   * @param eventName
   * @param callback
   */
  off (eventName, callback) {
    if (!this.eventCallbacks[eventName]) {
      throw Error('An event with this name has not been registered yet', eventName)
    }
    let cbInd = this.eventCallbacks[eventName].findIndex(cb => cb.callback === callback)
    this.eventCallbacks[eventName].splice(cbInd, 1)
  }

  /**
   * Dispatch an event with eventName using the 'call' method
   * @param {string} eventName
   * @param {any|repeated} [args=null]
   */
  dispatch (eventName, ...args) {
    if (this.eventCallbacks[eventName]) {
      let i = this.eventCallbacks[eventName].length
      while (i--) {
        this.eventCallbacks[eventName][i].callback.call(this.eventCallbacks[eventName][i].context, ...args)
      }
    }
  }

  /**
   * Dispatch an event with eventName using the 'apply' method
   * @param {string} eventName
   * @param {array} [args=[]]
   */
  dispatchApply (eventName, args = []) {
    if (this.eventCallbacks[eventName]) {
      let i = this.eventCallbacks[eventName].length
      while (i--) {
        this.eventCallbacks[eventName][i].callback.apply(this.eventCallbacks[eventName][i].context, args)
      }
    }
  }

  /**
   * Alias for the dispatch method
   * @param eventName
   * @param args
   */
  emit (eventName, ...args) {
    this.dispatch(eventName, ...args)
  }
}
