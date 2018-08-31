import debounce from 'lodash/debounce'
export default class SizeLimitedMap<T> {
  private map: Map<any, T> = new Map()
  private meta: object = {}
  public byteSize: number = 0
  public entries: Function = this.map.entries.bind(this.map)
  public forEach: Function = this.map.forEach.bind(this.map)
  public keys: Function = this.map.keys.bind(this.map)

  private evict: Function
  /**
   * An instrumented map which keeps track of the approximate size of our map and evicts the last used values first. It
   * has pretty much the same interface as the ECMAScript 6 Map
   * @param maxByteSize
   */
  constructor (public maxByteSize: number = 10000) {
    const debounced = debounce(this._evict.bind(this), 0)
    this.evict = () => {
      console.log('evicting at next tick')
      debounced()
    }
  }

  /**
   * Get an item by key
   * @param key
   * @returns {any}
   */
  get (key: any) {
    let val = this.map.get(key)
    if (val && this.meta[key]) {
      this.meta[key].touched = Date.now()
    }
    return val
  }

  /**
   * Check if an item
   * @param key
   * @returns {boolean}
   */
  has (key: any) {
    if (this.map.has(key)) {
      if (this.meta[key]) {
        this.meta[key].touched = Date.now()
      }
      return true
    } else {
      return false
    }
  }

  /**
   * Set a value in the map
   * @param key
   * @param {T} val
   */
  set (key: any, val: T) {
    this.map.set(key, val)
    let size = SizeLimitedMap.roughSizeOfObject(key) + SizeLimitedMap.roughSizeOfObject(val)
    this.meta[key] = {
      touched: Date.now(),
      size: size
    }
    this.byteSize += size
    if (this.byteSize > this.maxByteSize) {
      this.evict()
    }
  }

  /**
   * Remove an item from the map
   * @param key
   */
  delete (key) {
    let meta = this.meta[key]
    this.map.delete(key)
    delete this.meta[key]
    this.byteSize -= meta.size
  }

  /**
   * Remove the oldest items from the map
   * @private
   */
  private _evict () {
    let keyOrder = Object.keys(this.meta).map(key => ({
      key: key,
      date: this.meta[key].touched
    })).sort(function (a, b) {
      return b.date - a.date
    })
    let count = 0
    while ((this.byteSize - (this.maxByteSize / 10)) > this.maxByteSize) {
      let next = keyOrder.pop()
      this.delete(next.key)
      count++
    }
    console.log(`evicting ${count} members`)
  }

  /**
   * Returns the rough size of anything in bytes
   * @param object
   * @returns {number}
   */
  static roughSizeOfObject (object: any) {
    let objectList = []
    let stack = [object]
    let bytes = 0

    while (stack.length) {
      let value = stack.pop()

      if (typeof value === 'boolean') {
        bytes += 4
      } else if (typeof value === 'string') {
        bytes += value.length * 2
      } else if (typeof value === 'number') {
        bytes += 8
      } else if (typeof value === 'object' && objectList.indexOf(value) === -1) {
        objectList.push(value)
        for (let i in value) {
          stack.push(value[i])
        }
      }
    }
    return bytes
  }

  get length () {
    return this.map.size
  }

  get size () {
    return this.map.size
  }

}
