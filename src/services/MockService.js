/**
 * Container for helpful mocking functions. Primarily the expand function
 */
export default class MockService {
  /**
   * Make a deep copy of an object while also evaluating any functions that it finds. This effectively creates a copy of
   * an object with every single function evaluated and the return values from those functions assigned to the place
   * they originated from.
   * @param generator
   */
  static expand (generatorExpression, _depth = 0) {
    let result = null
    if (_depth > 1000) {
      throw Error('Max depth of generator has been exceeded')
    }
    if (typeof generatorExpression === 'object') {
      result = {}
      for (let key in generatorExpression) {
        result[key] = MockService.expand(generatorExpression[key], _depth + 1)
      }
    } else if (Array.isArray(generatorExpression)) {
      result = []
      for (let i = 0; i < generatorExpression.length; i++) {
        result.push(MockService.expand(generatorExpression[i]), _depth + 1)
      }
    } else if (typeof generatorExpression === 'function') {
      result = MockService.expand(generatorExpression(), _depth + 1)
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
  static randomInt (max, min = 0) {
    return Math.floor(Math.random() * max) + Math.floor(min)
  }

  /**
   * Create an array of random length between min and max. Each item is assigned by the result of the generator function
   * @param {Function} generator
   * @param {Number} min
   * @param {Number} max
   * @returns {Array}
   */
  static arrayGenerate (generator, min = 0, max = 10) {
    let n = MockService.randomInt(max, min)
    let array = []
    for (let i = 0; i < n; i++) {
      array.push(generator())
    }
    return array
  }

}
