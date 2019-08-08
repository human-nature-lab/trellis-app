export default class Timer {
  public isRunning: boolean = false
  public hasExpired: boolean = false
  public elapsed: number = 0
  public progress: number = 0
  private intervalId: number
  private lastTickTimstamp: number = null

  constructor (public duration: number, public interval: number = 1000) {}

  start (): this {
    if (this.isRunning || this.hasExpired) return this
    this.isRunning = true
    // @ts-ignore
    this.intervalId = setInterval(this.tick.bind(this), this.interval)
    this.lastTickTimstamp = Date.now()
    return this
  }

  tick (interval?: number): this {
    if (!interval) {
      const now = Date.now()
      interval = now - this.lastTickTimstamp
      this.lastTickTimstamp = now
    }
    this.elapsed += interval
    this.progress = this.elapsed / this.duration
    this.hasExpired = this.elapsed >= this.duration
    if (this.hasExpired) {
      this.stop()
    }
    return this
  }

  stop (): this {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
    this.isRunning = false
    return this
  }

  reset (): this {
    this.elapsed = 0
    this.progress = 0
    this.hasExpired = false
    return this.stop()
  }
}
