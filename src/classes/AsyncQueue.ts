import { Hook } from './Hook'

export class AsyncQueue<T, R = void> {
  public pending: T[] = []
  public total = 0
  public results: R[] = []
  public onExec = new Hook()
  private isCancelled = false

  constructor (private exec: (item: T) => Promise<R>, public numSimultaneous = 8) { }

  async add (...args: T[]) {
    this.total += args.length
    this.pending.push(...args)
    return this
  }

  async run (): Promise<R[]> {
    const threads = []
    for (let i = 0; i < this.numSimultaneous; i++) {
      threads.push(this.runThread())
    }
    await Promise.all(threads)
    return this.results
  }

  cancel = () => {
    this.isCancelled = true
  }

  private async runThread () {
    let item = this.pending.pop()
    while (item && !this.isCancelled) {
      const res = await this.exec(item)
      if (res) {
        this.results.push(res)
      }
      this.onExec.emit()
      item = this.pending.pop()
    }
  }
}
