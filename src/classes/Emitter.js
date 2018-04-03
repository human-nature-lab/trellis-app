export default class Emitter {
  constructor () {
    this.eventCallbacks = {}
  }

  register (eventName) {
    if (this.eventCallbacks[eventName]) {
      throw Error('An event with this name has already been registered', eventName)
    }
    this.eventCallbacks[eventName] = []
  }

  on (eventName, callback, context = null) {
    if (!this.eventCallbacks[eventName]) {
      this.register(eventName)
    }
    this.eventCallbacks[eventName].unshift({
      callback: callback,
      context: context
    })
  }

  off (eventName, callback) {
    if (!this.eventCallbacks[eventName]) {
      throw Error('An event with this name has not been registered yet', eventName)
    }
    let cbInd = this.eventCallbacks[eventName].findIndex(cb => cb.callback === callback)
    this.eventCallbacks[eventName].splice(cbInd, 1)
  }

  dispatch (eventName, ...args) {
    if (this.eventCallbacks[eventName]) {
      let i = this.eventCallbacks[eventName].length
      while (i--) {
        this.eventCallbacks[eventName][i].callback.call(this.eventCallbacks[eventName][i].context, ...args)
      }
    }
  }

  emit (eventName, ...args) {
    this.dispatch(eventName, ...args)
  }
}
