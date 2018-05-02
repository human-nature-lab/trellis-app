export default class Clock {
  /**
   * An abstraction for a group of integers that are dependent on each other, but don't follow the conventions of a
   * normal integers like time.
   * Ex:
   *   The time of day is represented by a series of dependent numbers that have different maximum values. For example
   *   08:15 can be represented by two integers (hours and minutes), but the hours have a maximum value of 24 while the
   *   minutes have a maximum value of 59. Furthermore, if the minutes go above the max then the hours should increment
   *   and if the minutes go below 0 they should decrement. This can be abstracted to an arbitrary number of values with
   *   distinct min and max values.
   * @param {Array} time - The current time as an array. Ex: [8, 15]
   * @param {Array} [clockMax = null] - The maximum time as an array. Ex: [24, 59]
   * @param {Array} [clockMin = null] - The minimum time as an array. Ex: [0, 0]
   */
  constructor (time, clockMax = null, clockMin = null) {
    this.time = time
    this.clockMax = clockMax // Inclusive max boundary array
    this.clockMin = clockMin // Inclusive min boundary array
    this._isAtMin = null     // Cached value
    this._isAtMax = null     // Cached value
    if (!this.time) {
      throw Error('initial clock must be defined')
    } else {
      if (this.clockMax && this.time.length !== this.clockMax.length) {
        throw Error('clock max state must be the same length as the clock')
      } else if (this.clockMin && this.time.length !== this.clockMin.length) {
        throw Error('clock min state must be the same length as the clock')
      }
    }
    this.validateTime()
  }

  /**
   * Validate that the time is within the min and max values. Throws error if it isn't a valid time
   */
  validateTime () {
    for (let i = 0; i < this.time.length; i++) {
      if ((this.clockMax && this.time[i] > this.clockMax[i]) || (!this.clockMax && this.time[i] > 9)) {
        throw new Error(`Time value at ${i} exceeds the maximum allowed value`)
      }
      if ((this.clockMin && this.time[i] < this.clockMin[i]) || (!this.clockMin && this.time[i] < 0)) {
        throw new Error(`Time value at ${i} is less than the minimum allowed value`)
      }
    }
  }

  /**
   * Checks if the clock is at the minimum possible value
   * @returns {boolean}
   */
  get isAtMin () {
    if (this._isAtMin !== null) {
      return this._isAtMin
    }
    let i = this.time.length
    while (i--) {
      if (this.clockMin) {
        if (this.time[i] > this.clockMin[i]) {
          this._isAtMin = false
          return false
        }
      } else if (this.time[i] > 0) {
        this._isAtMin = false
        return false
      }
    }
    this._isAtMin = true
    return true
  }

  get isAtMax () {
    if (this._isAtMax !== null) {
      return this._isAtMax
    }
    let i = this.time.length
    while (i--) {
      if (this.clockMax) {
        if (this.time[i] < this.clockMax[i]) {
          this._isAtMax = false
          return false
        }
      } else if (this.time[i] < 9) {
        this._isAtMax = false
        return false
      }
    }
    this._isAtMax = true
    return true
  }

  /**
   * Increase the time by 1.
   */
  increment () {
    if (this.isAtMax) return
    // Invalidate cache
    this._isAtMin = null
    this._isAtMax = null
    let done
    let index = this.time.length - 1
    do {
      done = true
      this.time[index]++
      if ((this.clockMax && this.time[index] > this.clockMax[index]) ||
        (!this.clockMax && this.time[index] > 9)) {
        this.time[index] = this.clockMin ? this.clockMin[index] : 0
        index--
        done = false
      }
      // We are already at the max state so we need to exit without exceeding the max state
      if (index < 0) {
        return
      }
    } while (!done)
  }

  /**
   * Decrease the time by 1.
   */
  decrement () {
    if (this.isAtMin) return
    // Invalidate cache
    this._isAtMax = null
    this._isAtMin = null
    let done
    let index = this.time.length - 1
    do {
      done = true
      this.time[index]--
      if ((this.clockMin && this.time[index] < this.clockMin[index]) ||
        (!this.clockMin && this.time[index] < 0)) {
        this.time[index] = this.clockMax ? this.clockMax[index] : 9
        index--
        done = false
      }
      // We are at the minimum state so we need to exit without passing it
      if (index >= this.time.length) {
        return
      }
    } while (!done)
  }
}
