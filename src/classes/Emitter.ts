export default class Emitter {
  private eventCallbacks: object = {}

  /**
   * Register an event type by name. This method is called when the 'on' method is called if an event of that type has
   * not been registered yet.
   * @param eventName
   */
  register (eventName: string) {
    if (this.eventCallbacks[eventName]) {
      throw Error('An event with this name has already been registered: ' + eventName)
    }
    this.eventCallbacks[eventName] = []
  }

  /**
   * Add an event callback with optional context
   * @param {string} eventName
   * @param {function} callback
   * @param {object} context
   */
  on (eventName: string, callback: Function, context?: object) {
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
   * @param {string} eventName
   * @param {Function} callback
   * @param {boolean} [force]
   */
  off (eventName: string, callback: Function, force: boolean = false) {
    if (!this.eventCallbacks[eventName]) {
      if (force) return
      throw Error('An event with this name has not been registered yet: ' + eventName)
    }
    let cbInd = this.eventCallbacks[eventName].findIndex(cb => cb.callback === callback)
    this.eventCallbacks[eventName].splice(cbInd, 1)
  }

  /**
   * Dispatch an event with eventName using the 'call' method
   * @param {string} eventName
   * @param {..any} [args]
   */
  dispatch (eventName: string, ...args: any[]) {
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
  dispatchApply (eventName: string, args: any[] = []) {
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
  emit (eventName: string, ...args: any[]) {
    this.dispatch(eventName, ...args)
  }

  /**
   * Remove all listeners from this instance
   */
  removeListeners () {
    this.eventCallbacks = {}
  }

  /**
   * Getter to check if any listeners are present on this emitter
   * @returns {boolean}
   */
  get hasListeners () {
    for (let key in this.eventCallbacks) {
      if (this.eventCallbacks[key].length) {
        return true
      }
    }
    return false
  }
}
