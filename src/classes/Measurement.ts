interface Tick {
  startTime: number
  endTime: number
  duration: number
  min: number
  max: number
  average: number
  name: string
}

export default class Measurement {
  public min: number = Number.POSITIVE_INFINITY
  public max: number = Number.NEGATIVE_INFINITY
  public sum: number = 0
  public n: number = 0
  public startTime: number

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

  public stopTick (): Tick {
    if (!this.startTime) {
      throw new Error('Must start a tick before stopping one')
    }
    const endTime = performance.now()
    const val = endTime - this.startTime
    if (val < this.min) {
      this.min = val
    }
    if (val > this.max) {
      this.max = val
    }
    this.startTime = null
    this.sum += val
    this.n++
    return {
      startTime: this.startTime,
      endTime,
      duration: val,
      min: this.min,
      max: this.max,
      average: this.sum / this.n,
      name: this.name
    }
  }

  public get average (): number {
    return this.sum / this.n
  }

  public end () {
    console.log(`${this.name} - Average: ${this.average.toFixed(2)}  Total: ${this.sum.toFixed(2)}  Count: ${this.n}  Min: ${this.min}  Max: ${this.max}`)
  }
}
