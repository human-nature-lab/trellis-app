/**
 * Container for helpful mocking functions. Primarily the expand and expandPromise functions.
 * The reason that this class exists is to easily take advantage of the faker library when creating
 * large, specific data structures that follow the same pattern, but can't reference each other.
 * Generator expressions are just functions that return another data structure so that each version
 * of the data structure is distinct and doesn't reference another version of the structure.
 */
export default class GeneratorService {
  constructor () {
    this.expand = this.expand.bind(this)
    this.expandPromise = this.expandPromise.bind(this)
    this.randomInt = this.randomInt.bind(this)
    this.arrayGenerate = this.arrayGenerate.bind(this)
    this.randomSelect = this.randomSelect.bind(this)
  }

  /**
   * Expand with a promise
   * @param generatorExpression
   * @returns {Promise<any>}
   */
  expandPromise (generatorExpression) {
    return new Promise((resolve, reject) => {
      try {
        return resolve(this.expand(generatorExpression))
      } catch (err) {
        return reject(err)
      }
    })
  }

  /**
   * Make a deep copy of an object while also evaluating any functions that it finds. This effectively creates a copy of
   * an object with every single function evaluated and the return values from those functions assigned to the place
   * they originated from.
   * @param {Function} generatorExpression
   * @returns {any}
   */
  expand (generatorExpression, _depth = 0) {
    let result = null
    if (_depth > 1000) {
      throw Error('Max depth of generator has been exceeded')
    }
    if (Array.isArray(generatorExpression)) {
      result = []
      for (let i = 0; i < generatorExpression.length; i++) {
        result.push(this.expand(generatorExpression[i]), _depth + 1)
      }
    } else if (typeof generatorExpression === 'object') {
      result = {}
      for (let key in generatorExpression) {
        result[key] = this.expand(generatorExpression[key], _depth + 1)
      }
    } else if (typeof generatorExpression === 'function') {
      result = this.expand(generatorExpression(), _depth + 1)
    } else {
      result = generatorExpression
    }
    return result
  }

  /**
   * Random integer
   * @param {Number} max
   * @param {Number} [min=0]
   * @returns {number}
   */
  randomInt (max, min = 0) {
    return Math.floor(Math.random() * max) + Math.floor(min)
  }

  /**
   * Select a random item from a collection
   * @param {Array} collection
   */
  randomSelect (arr) {
    return arr[this.randomInt(arr.length - 1)]
  }

  /**
   * Create an array of random length between min and max. Each item is assigned by the result of the generator function
   * @param {Function} generator
   * @param {Number} min
   * @param {Number} max
   * @returns {Array}
   */
  arrayGenerate (generator, min = 0, max = 10) {
    let n = this.randomInt(max, min)
    let array = []
    for (let i = 0; i < n; i++) {
      array.push(generator(i, array))
    }
    return array
  }

}