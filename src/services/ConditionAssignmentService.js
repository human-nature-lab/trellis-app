export default class ConditionAssignmentService {
  constructor () {
    this.conditionAssignmentMethods = {}
  }

  /**
   * Register an eval function with a unique name
   */
  register (name, functionString) {
    // TODO: Do this safely instead. Maybe consider using -> https://github.com/andywer/threads.js/tree/master
    this.conditionAssignmentMethods[name] = self.eval('(function() {return ' + functionString + '})()')
  }

  /**
   * Unregister an eval function with a unique name
   */
  unregister (name) {
    delete this.conditionAssignmentMethods[name]
  }

  /**
   * Call a registered method by name with any number of arguments. This returns false if there isn't a function registered
   */
  eval (name, ...args) {
    if (this.conditionAssignmentMethods[name]) {
      return this.conditionAssignmentMethods[name].call(null, ...args)
    } else {
      return false
    }
  }

  /**
   * Remove all registered functions
   */
  clear () {
    this.conditionAssignmentMethods = {}
  }
}
