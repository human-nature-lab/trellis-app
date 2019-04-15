import debounce from 'lodash/debounce'
import {roughSizeOf} from "./M";

interface SizeMeta {
  touched: number,
  size: number
}

export default class SizeLimitedMap<T> {
  private map: Map<any, T> = new Map()
  private meta: Map<any, SizeMeta> = new Map()
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
    const val = this.map.get(key)
    const meta = this.meta.get(key)
    if (val && meta) {
      meta.touched = Date.now()
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
      const meta = this.meta.get(key)
      if (meta) {
        meta.touched = Date.now()
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
    const existingMeta = this.meta.get(key)
    this.map.set(key, val)
    let size = roughSizeOf(key) + roughSizeOf(val)
    this.meta.set(key, {
      touched: Date.now(),
      size: size
    })
    if (existingMeta) {
      this.byteSize -= existingMeta.size
    }
    this.byteSize += size
    if (this.byteSize > this.maxByteSize && this.size > 1) {
      this.evict()
    }
  }

  /**
   * Remove an item from the map
   * @param key
   */
  delete (key: any) {
    let meta = this.meta.get(key)
    this.map.delete(key)
    this.meta.delete(key)
    this.byteSize -= meta.size
  }

  /**
   * Remove the oldest items from the map
   * @private
   */
  private _evict () {
    const keyOrder = Array.from(this.meta.keys()).map(key => ({
      key: key,
      date: this.meta.get(key).touched
    })).sort(function (a, b) {
      return b.date - a.date
    })
    let count = 0
    while ((this.byteSize - (this.maxByteSize / 10)) > this.maxByteSize && this.size > 1) {
      let next = keyOrder.pop()
      this.delete(next.key)
      count++
    }
    console.log(`evicting ${count} members`)
  }

  get length () {
    return this.map.size
  }

  get size () {
    return this.map.size
  }

}
