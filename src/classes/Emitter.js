export default class Emitter {
  constructor () {
    this._eventCallbacks = {}
  }

  /**
   * Register an event type by name. This method is called when the 'on' method is called if an event of that type has
   * not been registered yet.
   * @param eventName
   */
  register (eventName) {
    if (this._eventCallbacks[eventName]) {
      throw Error('An event with this name has already been registered', eventName)
    }
    this._eventCallbacks[eventName] = []
  }

  /**
   * Add an event callback with optional context
   * @param eventName
   * @param callback
   * @param context
   */
  on (eventName, callback, context = null) {
    if (!this._eventCallbacks[eventName]) {
      this.register(eventName)
    }
    this._eventCallbacks[eventName].unshift({
      callback: callback,
      context: context
    })
  }

  /**
   * Remove an event callback by reference
   * @param eventName
   * @param callback
   */
  off (eventName, callback, force = false) {
    if (!this._eventCallbacks[eventName]) {
      if (force) return
      throw Error('An event with this name has not been registered yet', eventName)
    }
    let cbInd = this._eventCallbacks[eventName].findIndex(cb => cb.callback === callback)
    this._eventCallbacks[eventName].splice(cbInd, 1)
  }

  /**
   * Dispatch an event with eventName using the 'call' method
   * @param {string} eventName
   * @param {any|repeated} [args=null]
   */
  dispatch (eventName, ...args) {
    if (this._eventCallbacks[eventName]) {
      let i = this._eventCallbacks[eventName].length
      while (i--) {
        this._eventCallbacks[eventName][i].callback.call(this._eventCallbacks[eventName][i].context, ...args)
      }
    }
  }

  /**
   * Dispatch an event with eventName using the 'apply' method
   * @param {string} eventName
   * @param {array} [args=[]]
   */
  dispatchApply (eventName, args = []) {
    if (this._eventCallbacks[eventName]) {
      let i = this._eventCallbacks[eventName].length
      while (i--) {
        this._eventCallbacks[eventName][i].callback.apply(this._eventCallbacks[eventName][i].context, args)
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

  /**
   * Getter to check if any listeners are present on this emitter
   * @returns {boolean}
   */
  get hasListeners () {
    for (let key in this._eventCallbacks) {
      if (this._eventCallbacks[key].length) {
        return true
      }
    }
    return false
  }
}
