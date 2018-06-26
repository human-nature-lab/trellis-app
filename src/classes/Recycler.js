/**
 * Abstract recycler class for reusing objects
 */
export default class Recycler {
  constructor () {
    this.cache = new Map()
  }

  /**
   * Remove all previous data by resetting the cache
   */
  clear () {
    this.cache.clear()
  }

  /**
   * Function that must be overriden by parent class before using the fill or getNoKey methods. Should take an object
   * and return a string that is the unique key for that object
   * @param obj
   * @returns {string}
   */
  keyExtractor (obj) {
    throw Error('Define a key extractor before using the fill method')
  }

  /**
   * Function that must be defined by parent class to use this class effectively
   * @param {...any} params - Any parameters
   * @returns {any}
   */
  objectCreator (...params) {
    throw Error('Object creator must be defined to use this class')
  }

  /**
   * Store a bunch of objects at once to
   * @param items
   */
  fill (items) {
    for (let item of items) {
      let key = this.keyExtractor(item)
      this.set(key, item)
    }
  }

  /**
   * Get a single object by key. If the object for that key doesn't already exist it will be created using the
   * objectCreator method. All arguments after the key parameter will be included with the objectCreator method
   * @param {any} key
   * @param {..any} params
   */
  get (key, ...params) {
    let obj = this.cache.get(key)
    if (!obj) {
      obj = this.objectCreator(...params)
      this.set(key, obj)
    }
    return JSON.parse(JSON.stringify(obj))
  }

  /**
   * Get without a key. The key will be created by calling the keyExtractor method with the results of the objectCreator
   * method. This method is much more expensive than just calling the get method since it needs to create a new instance
   * of the object and key regardless of if another one already exists
   * @param {...any} params
   */
  getNoKey (...params) {
    let key = this.keyExtractor(this.objectCreator(...params))
    return this.get(key, ...params)
  }

  /**
   * Set a single object by key
   * @param key
   * @param obj
   */
  set (key, obj) {
    this.cache.set(key, obj)
  }
}
