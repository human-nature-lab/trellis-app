export default class ConditionAssignmentService {
  constructor () {
    this.conditionAssignmentMethods = {}
  }

  /**
   * Register an eval function with a questionId
   */
  register (name, functionString) {
    // TODO: Do this safely instead. Maybe consider using -> https://github.com/andywer/threads.js/tree/master
    this.conditionAssignmentMethods[name] = self.eval('(function() {return ' + functionString + '})()')
  }

  /**
   * Check if a condition should be assigned
   */
  eval (name, ...args) {
    return this.conditionAssignmentMethods[name].call(null, ...args)
  }
}
