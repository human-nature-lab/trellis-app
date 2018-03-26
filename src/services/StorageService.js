/**
 * Simple storage that will persist things in localStorage and cache them in memory if they are still being used
 */
export class StorageService {
  constructor () {
    this.data = new Map()
  }

  /**
   * Get a value from localStorage with a type hint. The type is necessary to parse the data correctly on get
   * @param name
   * @param type
   * @returns {any}
   * @private
   */
  _getLocalStorage (name, type) {
    switch (type) {
      case 'object':
        return JSON.parse(window.localStorage.getItem(name))
      case 'string':
      default:
        return window.localStorage.getItem(name)
    }
  }

  /**
   * Set a value in localStorage
   * @param name
   * @param data
   * @private
   */
  _setLocalStorage (name, data) {
    switch (typeof data) {
      case 'object':
        window.localStorage.setItem(name, JSON.stringify(data))
        break
      case 'string':
      default:
        window.localStorage.setItem(name, data)
    }
  }

  /**
   * Get a value from the storage service
   * @param name
   * @returns {*|null}
   */
  get (name, type = 'string') {
    if (!this.data.has(name)) {
      this.data.set(name, this._getLocalStorage(name, type))
    }
    return this.data.get(name) || null
  }

  set (name, data) {
    this._setLocalStorage(name, data)
    this.data.set(name, data)
    return data
  }
}

export default new StorageService()
