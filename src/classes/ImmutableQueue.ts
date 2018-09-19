export default class ImmutableQueue<T> {
  private index: number = 0
  constructor (private array: T[]) {}

  /**
   * Take the next item off the queue
   * @returns {T}
   */
  next (): T {
    const o = this.array[this.index]
    this.index++
    return o
  }

  /**
   * Look at the next item on the queue without removing it
   * @returns {T}
   */
  peek (): T {
    return this.array[this.index]
  }

  /**
   * Get the size of the queue
   * @returns {number}
   */
  get size (): number {
    return this.array.length - this.index
  }

}
