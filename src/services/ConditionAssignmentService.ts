export default class ConditionAssignmentService {
  public conditionAssignmentMethods: Map<string, Function> = new Map()

  /**
   * Register an eval function with a unique name
   * @param id
   * @param functionString
   */
  register (id: string, functionString: string): void {
    // TODO: Do this safely instead. Maybe consider using -> https://github.com/andywer/threads.js/tree/master
    this.conditionAssignmentMethods.set(id, eval(`(function() {'use strict'; return ${functionString}})()`))
  }

  /**
   * Unregister an eval function with a unique id
   * @param id
   */
  unregister (id: string): void {
    this.conditionAssignmentMethods.delete(id)
  }

  /**
   * Call a registered method by id with any number of arguments. This returns false if there isn't a function registered
   * @param id
   * @param args
   * @returns {*}
   */
  run (id: string, ...args): boolean {
    if (this.conditionAssignmentMethods.get(id)) {
      return this.conditionAssignmentMethods.get(id).call(null, ...args)
    } else {
      return false
    }
  }

  /**
   * Remove all registered functions
   */
  clear () {
    this.conditionAssignmentMethods.clear()
  }
}
