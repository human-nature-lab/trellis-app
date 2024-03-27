import { Hook } from '@/lib/Hook'

type EpochMessage = {
  epoch: number
  data: any
}

type Socket = {
  connect (): Promise<void>
  disconnect (): Promise<void>
  send (msg: EpochMessage): Promise<void>
  onMessage(fn: (msg: EpochMessage) => void): void
}

class MaxMap<K, T> extends Map<K, T> {
  public maxSize = 5
  private keyOrder: K[] = []

  public set (key: K, value: T): this {
    super.set(key, value)
    this.keyOrder.push(key)
    while (this.size > this.maxSize) {
      this.delete(this.keyOrder.shift())
    }
    return this
  }
}

export class Connection {
  public status: 'disconnected' | 'connected' | 'connecting' = 'disconnected'
  public epoch = 0
  public lastReceivedEpoch = -1
  public onError = new Hook<[Error]>()
  public onMessage = new Hook<[any]>()
  public messageHistory = new MaxMap<number, any>()

  constructor (private socket: Socket) {
    this.socket.onMessage(this.receiveMessage)
  }

  private receiveMessage = (msg: EpochMessage) => {
    if (this.lastReceivedEpoch === -1) {
      this.lastReceivedEpoch = msg.epoch
    } else if (msg.epoch !== this.lastReceivedEpoch + 1) {
      // TODO: try to recover the missed message before emitting an error
      this.onError.emit(new Error('Missed message'))
    }
    this.lastReceivedEpoch = msg.epoch
    this.onMessage.emit(msg.data)
  }

  public async connect () {
    try {
      this.status = 'connecting'
      await this.socket.connect()
      this.status = 'connected'
    } catch (err) {
      this.onError.emit(err)
    }
  }

  public async disconnect () {
    try {
      this.status = 'disconnected'
      await this.socket.disconnect()
    } catch (err) {
      this.onError.emit(err)
    }
  }

  public async send (data: any) {
    try {
      this.epoch++
      this.messageHistory.set(this.epoch, data)
      await this.socket.send({ epoch: this.epoch, data })
    } catch (err) {
      this.onError.emit(err)
    }
  }
}
