import _ from 'lodash'
import Emitter from '@/classes/Emitter'
export class ScrollListener extends Emitter {
  /**
   * Lazily attached scroll listener with debounce. Useful for limiting the number of debounces being performed
   * @param {Number} [rate = 200] - The debounce time (ms)
   * @param {Object} [target = window] - The scroll target
   */
  constructor (rate = 200, target = window) {
    super()
    this.target = target
    this.rate = rate
    this.isAttached = false
    this.bubbleAll = true
    this._scrollHandler = _.debounce(() => {
      this.emit('scroll')
    }, this.rate)
  }

  attach () {
    window.addEventListener('scroll', this._scrollHandler, this.bubbleAll)
    this.isAttached = true
  }

  detach () {
    window.removeEventListener('scroll', this._scrollHandler)
    this.isAttached = false
  }

  on (...args) {
    if (!this.isAttached) {
      this.attach()
    }
    Emitter.prototype.on.call(this, ...args)
  }

  off (...args) {
    if (!this.hasListeners) {
      this.detach()
    }
    Emitter.prototype.off.call(this, ...args)
  }
}

export default new ScrollListener()
