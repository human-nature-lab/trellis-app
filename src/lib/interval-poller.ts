type PollerFunc = () => boolean

export class IntervalPoller {
  private intervalId
  private timeoutId
  private resolvers: (() => void)[] = []
  private rejecters: ((err: Error) => void)[] = []
  private isDone = false
  private result = false
  constructor (private poller: PollerFunc, private intervalMS: number, private timeoutMS = 30 * 1000) {}

  private check = () => {
    if (this.poller()) {
      console.log('success')
      clearInterval(this.intervalId)
      clearTimeout(this.timeoutId)
      this.isDone = true
      this.result = true
      this.resolvers.forEach(resolve => resolve())
      this.resolvers = []
      this.rejecters = []
    }
  }

  private start () {
    console.log('start poller')
    this.intervalId = setInterval(this.check, this.intervalMS)
    this.timeoutId = setTimeout(() => {
      console.log('Timeout')
      clearInterval(this.intervalId)
      this.isDone = true
      this.result = false
      this.rejecters.forEach(reject => reject(new Error('Timeout')))
      this.resolvers = []
      this.rejecters = []
    }, this.timeoutMS)
    setTimeout(this.check, 0)
  }

  wait () {
    if (this.isDone) {
      return this.result
    }
    if (!this.intervalId) {
      this.start()
    }
    return new Promise<void>((resolve, reject) => {
      console.log('waiting')
      this.resolvers.push(resolve)
      this.rejecters.push(reject)
    })
  }
}
