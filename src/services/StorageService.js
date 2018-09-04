/**
 * Simple storage that will persist things in localStorage and cache them in memory if they are still being used
 * TODO: Encode the data format with the stored values instead of requiring them as an argument
 */
export class StorageService {
  constructor () {
    this.data = new Map()
  }

  /**
   * Clear all items out of local storage
   */
  clear () {
    this.data = new Map()
    window.localStorage.clear()
  }

  /**
   * Get a value from localStorage with a type hint. The type is necessary to parse the data correctly on get
   * @param name
   * @param type
   * @returns {any}
   * @private
   */
  _getLocalStorage (name) {
    try {
      let o = JSON.parse(window.localStorage.getItem(name))
      return o.d
    } catch (err) {
      return undefined
    }
  }

  /**
   * Set a value in localStorage
   * @param name
   * @param data
   * @private
   */
  _setLocalStorage (name, data) {
    let o = {
      t: 'object',
      d: data
    }
    if (typeof data === 'string') {
      o.t = 'string'
    }
    window.localStorage.setItem(name, JSON.stringify(o))
  }

  /**
   * Get a value from the storage service
   * @param {String} key
   * @returns {*|null}
   */
  get (key) {
    if (this.data.has(key)) {
      return this.data.get(key)
    }
    let local = this._getLocalStorage(key)
    if (local !== undefined && local !== null) {
      this.data.set(key, local)
      return local
    } else {
      return null
    }
  }

  /**
   * Set a key, value pair in local storage
   * @param {String|Number} key
   * @param {*} data - Must be JSON serializable
   * @returns {*}
   */
  set (key, data) {
    this._setLocalStorage(key, data)
    this.data.set(key, data)
    return data
  }

  /**
   * Delete a key from local storage
   * @param {String} key
   */
  delete (key) {
    this.data.delete(key)
    window.localStorage.removeItem(key)
  }
}

export default new StorageService()
