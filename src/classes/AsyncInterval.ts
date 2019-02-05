type AsyncCallback = (...args: any[]) => PromiseLike<any|void>

class AsyncIntervalInstance {
  private timeoutId: number
  private args: any[]
  private isRunning: boolean = true

  /**
   * An equivalent function to setInterval, but it waits for any asynchronous operations to complete before starting
   * queueing the next interval. This is important to prevent overlapping with long asynchronous processes.
   * @param callback
   * @param delay
   * @param args
   */
  constructor (private callback: AsyncCallback, private delay: number, private id: number, args: any[]) {
    this.args = args
    this.queueNext()
  }

  private queueNext () {
    this.timeoutId = setTimeout(this.loop.bind(this), this.delay)
  }

  private async loop () {
    this.timeoutId = null

    await this.callback(...this.args)

    if (this.isRunning) {
      this.queueNext()
    }
  }

  /**
   * Call to stop the interval
   */
  cancel () {
    this.isRunning = false
    if (this.timeoutId) {
      clearTimeout(this.timeoutId)
    }
    if (this.id && activeIntervals.has(this.id)) {
      activeIntervals.delete(this.id)
    }
  }
}

const activeIntervals: Map<number, AsyncIntervalInstance> = new Map()
let lastIntervalId = 0

export function setAsyncInterval (callback: AsyncCallback, delay: number = 0, ...args: any[]): number {
  lastIntervalId++
  const a = new AsyncIntervalInstance(callback, delay, lastIntervalId, args)
  activeIntervals.set(lastIntervalId, a)
  return lastIntervalId
}

export function clearAsyncInterval (intervalId: number) {
  const a = activeIntervals.get(intervalId)
  a.cancel()
}
