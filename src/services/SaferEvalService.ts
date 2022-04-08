const restrictedGlobals = ['window', 'self', 'top', 'document', 'XMLHttpRequest', 'fetch', 'WebAssembly', 'global', 'process', 'imports', 'webpack']
export default class SaferEvalService {
  public methods: Map<string, Function> = new Map()

  size () {
    return this.methods.size
  }

  /**
   * Register an eval function with a unique name
   * @param id
   * @param functionString
   */
  register(id: string, functionString: string): void {
    // TODO: Do this safely instead. Maybe consider using -> https://github.com/andywer/threads.js/tree/master
    this.methods.set(id, Function(`'use strict';
      return (function (${restrictedGlobals.join(',')}) {
        return ${functionString}
      })()
    `)())
  }

  /**
   * Unregister an eval function with a unique id
   * @param id
   */
  unregister(id: string): void {
    this.methods.delete(id)
  }

  /**
   * Call a registered method by id with any number of arguments. This returns false if there isn't a function registered
   * @param id
   * @param args
   * @returns {*}
   */
  run(id: string, ...args): boolean {
    if (this.methods.get(id)) {
      return this.methods.get(id).call(null, ...args)
    } else {
      return false
    }
  }

  /**
   * Remove all registered functions
   */
  clear() {
    this.methods.clear()
  }
}
