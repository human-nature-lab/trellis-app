export default class ConditionAssignmentService {
  constructor () {
    this.conditionAssignmentMethods = {}
  }

  /**
   * Register an eval function with a unique name
   * @param id
   * @param functionString
   */
  register (id, functionString) {
    // TODO: Do this safely instead. Maybe consider using -> https://github.com/andywer/threads.js/tree/master
    this.conditionAssignmentMethods[id] = self.eval('(function() {return ' + functionString + '})()')
  }

  /**
   * Unregister an eval function with a unique id
   * @param id
   */
  unregister (id) {
    delete this.conditionAssignmentMethods[id]
  }

  /**
   * Call a registered method by id with any number of arguments. This returns false if there isn't a function registered
   * @param id
   * @param args
   * @returns {*}
   */
  run (id, ...args) {
    if (this.conditionAssignmentMethods[id]) {
      return this.conditionAssignmentMethods[id].call(null, ...args)
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
