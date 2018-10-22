export default class Measurement {
  private ticks: number[] = []
  private sum: number = 0
  private n: number = 0
  private startTime: number

  constructor (public name: string) {}

  public reset () {
    this.ticks = []
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
    this.startTime = null
    this.ticks.push(val)
    this.sum += val
    this.n++
  }

  public get average (): number {
    return this.sum / this.n
  }

  public end () {
    console.log(`${this.name} - Average: ${this.average.toFixed(2)}  Total: ${this.sum.toFixed(2)}  Count: ${this.n}`)
  }
}
