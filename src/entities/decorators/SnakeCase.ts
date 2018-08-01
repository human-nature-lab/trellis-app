/**
 * Convert a camel case string into snake case
 * @param {string} str
 * @returns {string}
 */
function camelToSnake (str: string) {
  let snake: string = ''
  for (let char of str) {
    snake += char === char.toUpperCase() ? `_${char}` : char
  }
  return snake
}

/**
 * SnakeCase decorator duplicates a property so that it can be accessed via snake case or camelCase
 * @param {object} target
 * @param {string} camelKey - property key in camelCase
 * @returns undefined
 * @constructor
 */
export default function SnakeCase (target: object, camelKey: string) {
  const privateKey = `_${camelKey}`
  const snakeKey = camelToSnake(camelKey)
  Object.defineProperties(target, {
    [camelKey]: {
      get() {
        return this[privateKey]
      },
      set(val) {
        this[privateKey] = val
      }
    },
    [snakeKey]: {
      get () {
        return this[privateKey]
      },
      set(val) {
        this[privateKey] = val
      }
    }
  })
}
