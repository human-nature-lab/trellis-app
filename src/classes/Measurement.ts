export default class Measurement {
  private min: number = Number.POSITIVE_INFINITY
  private max: number = Number.NEGATIVE_INFINITY
  private sum: number = 0
  private n: number = 0
  private startTime: number

  constructor (public name: string) {}

  public reset () {
    this.min = Number.POSITIVE_INFINITY
    this.max = Number.NEGATIVE_INFINITY
    this.sum = 0
    this.n = 0
    this.startTime = null
  }

  public startTick () {
    this.startTime = performance.now()
  }

  public stopTick () {
    if (!this.startTime) {
      throw new Error('Must start a tick before stopping one')
    }
    const val = performance.now() - this.startTime
    if (val < this.min) {
      this.min = val
    }
    if (val > this.max) {
      this.max = val
    }
    this.startTime = null
    this.sum += val
    this.n++
  }

  public get average (): number {
    return this.sum / this.n
  }

  public end () {
    console.log(`${this.name} - Average: ${this.average.toFixed(2)}  Total: ${this.sum.toFixed(2)}  Count: ${this.n}  Min: ${this.min}  Max: ${this.max}`)
  }
}
