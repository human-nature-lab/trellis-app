import { delay } from './delay'
import { Hook } from './Hook'

export class DownloadQueue<T, R = void> {
  public pending: T[] = []
  public total = 0
  public results: R[] = []
  public onDownload = new Hook()
  private isCancelled = false

  constructor (private download: (item: T) => Promise<R>, public numSimultaneous = 8) { }

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
      const res = await this.download(item)
      if (res) {
        this.results.push(res)
      }
      this.onDownload.emit()
      item = this.pending.pop()
    }
  }
}
