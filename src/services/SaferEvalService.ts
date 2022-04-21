const restrictedGlobals = [
  'window',
  'self',
  'top',
  'document',
  'XMLHttpRequest',
  'fetch',
  'WebAssembly',
  'global',
  'process',
  'imports',
  'webpack',
]

export default class SaferEvalService {
  public methods = new Map<string, Function>()
  public context = new Map<string, any>()

  size () {
    return this.methods.size
  }

  /**
   * Register an eval function with a unique name
   * @param id
   * @param functionString
   */
  register (id: string, functionString: string, context?: any): void {
    // Remove invalid lines
    while (
      !(functionString.trim().startsWith('function') || functionString.trim().startsWith('(')) ||
      functionString === '') {
      functionString = functionString.split('\n').slice(1).join('\n')
    }
    // TODO: Do this safely instead. Maybe consider using -> https://github.com/andywer/threads.js/tree/master
    const fullString = `'use strict';
      return (function (${restrictedGlobals.join(',')}) {
        return ${functionString}
      })()
    `
    this.methods.set(id, Function(fullString)())
    if (context) {
      this.context.set(id, context)
    } else {
      this.context.set(id, fullString)
    }
  }

  /**
   * Unregister an eval function with a unique id
   * @param id
   */
  unregister (id: string): void {
    this.methods.delete(id)
  }

  /**
   * Call a registered method by id with any number of arguments. This returns false if there isn't a function
   * registered
   * @param id
   * @param args
   * @returns {*}
   */
  run (id: string, ...args): boolean {
    try {
      if (this.methods.get(id)) {
        return this.methods.get(id).call(null, ...args)
      } else {
        return false
      }
    } catch (err) {
      const context = this.context.get(id)
      console.error(id, context.split('\n').map((line, index) => index + 1 + ': ' + line).join('\n'))
      throw err
    }
  }

  /**
   * Remove all registered functions
   */
  clear () {
    this.methods.clear()
  }
}
