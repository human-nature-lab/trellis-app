export interface Recyclable<T> {
  keyExtractor(obj: T): string
  objectCreator(...any): T
}
/**
 * Abstract recycler class for reusing objects
 */
export default abstract class Recycler<T> {
  private cache: Map<string, T> = new Map()

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
  abstract keyExtractor (obj: T): string

  /**
   * Function that must be defined by parent class to use this class effectively
   * @param {...any} params - Any parameters
   * @returns {any}
   */
  abstract objectCreator (...params): T

  /**
   * Store a bunch of objects at once to
   * @param items
   */
  fill (items: T[]) {
    for (let item of items) {
      this.add(item)
    }
  }

  /**
   * Get a single object by key. If the object for that key doesn't already exist it will be created using the
   * objectCreator method. All arguments after the key parameter will be included with the objectCreator method
   * @param {string} key
   * @param {..any} params
   */
  get (key: string, ...params): T|null {
    let obj = this.cache.get(key)
    if (!obj) {
      obj = this.objectCreator(...params)
      this.set(key, obj)
    }
    // return JSON.parse(JSON.stringify(obj))
    if (obj && 'copy' in obj) {
      return obj['copy']()
    } else {
      return obj
    }
    // return obj
  }

  /**
   * Get without a key. The key will be created by calling the keyExtractor method with the results of the objectCreator
   * method. This method is much more expensive than just calling the get method since it needs to create a new instance
   * of the object and key regardless of if another one already exists
   * @param {...any} params
   */
  getNoKey (...params): T {
    let key = this.keyExtractor(this.objectCreator(...params))
    return this.get(key, ...params)
  }

  /**
   * Set a single object by key
   * @param {string} key
   * @param {T} obj
   */
  set (key: string, obj: T) {
    this.cache.set(key, obj)
  }

  /**
   * Add a single item to recycler set using the keyExtractor
   * @param {any} item
   */
  add (item: T) {
    let key = this.keyExtractor(item)
    this.set(key, item)
  }
}
