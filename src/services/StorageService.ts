/**
 * Simple storage that will persist things in localStorage and cache them in memory if they are still being used
 */
export class StorageService {
  private data: Map<string, any> = new Map()
  constructor (private cacheResults: boolean = true) {}

  /**
   * Clear all items out of local storage
   */
  clear () {
    this.data.clear()
    window.localStorage.clear()
  }

  /**
   * Get a value from localStorage with a type hint. The type is necessary to parse the data correctly on get
   * @param name
   * @param type
   * @returns {any}
   * @private
   */
  _getLocalStorage (name: string): any {
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
  _setLocalStorage (name: string, data: any) {
    let o = {
      d: data
    }
    window.localStorage.setItem(name, JSON.stringify(o))
  }

  /**
   * Get a value from the storage service
   * @param {String} key
   * @returns {*|null}
   */
  get (key: string) {
    if (this.cacheResults && this.data.has(key)) {
      return this.data.get(key)
    }
    let local = this._getLocalStorage(key)
    if (local != null) {
      if (this.cacheResults) {
        this.data.set(key, local)
      }
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
  set (key: string, data: any) {
    this._setLocalStorage(key, data)
    if (this.cacheResults) {
      this.data.set(key, data)
    }
    return data
  }

  /**
   * Delete a key from local storage
   * @param {String} key
   */
  delete (key: string) {
    if (this.cacheResults) {
      this.data.delete(key)
    }
    window.localStorage.removeItem(key)
  }


  /** Aliases for localStorage API **/
  setItem (key: string, data: any) {
    return this.set(key, data)
  }
  getItem (key: string): any {
    return this.get(key)
  }
  removeItem (key: string) {
    return this.delete(key)
  }

}

export default new StorageService()
