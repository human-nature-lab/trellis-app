import { Hook } from '@/lib/Hook'
import nearbyCommunications, { Connection, Strategy } from '.'
import { ClientToServer, ServerToClient } from './server'

export class Client {
  public state = 'disconnected'
  public onConnection = new Hook()

  private conn: Connection
  private intervalId = 0
  private unsubscribers: (() => void)[] = []
  private events = {} as Record<string, Hook>
  private requests = {} as Record<string, any>

  constructor (public serviceId: string, public strategy: Strategy, public pingInterval = 2000) {}

  async connect () {
    if (this.state !== 'disconnected') {
      throw new Error('Client cannot connect from this state: ' + this.state)
    }
    try {
      this.state = 'connecting'
      this.removeHooks()
      this.addHooks()
      await nearbyCommunications.startDiscovery(this.strategy, this.serviceId)
      this.intervalId = setInterval(this.ping, this.pingInterval) as unknown as number
      this.state = 'discovering'
    } catch (e) {
      this.state = 'disconnected'
      throw e
    }
  }

  async disconnect () {
    clearInterval(this.intervalId)
    this.events = {}
    this.onConnection = new Hook()
    this.removeHooks()
    try {
      this.state = 'disconnecting'
      await nearbyCommunications.stopDiscovery()
      this.state = 'disconnected'
    } catch (e) {
      this.state = 'failure'
      throw e
    }
  }

  private addHooks () {
    this.unsubscribers = [
      nearbyCommunications.hooks.onConnectionFound.add(this.onConnectionFound),
      nearbyCommunications.hooks.onConnectionLost.add(this.onConnectionLost),
      nearbyCommunications.hooks.onConnection.add(this.onConnectionHandler),
      nearbyCommunications.hooks.onEndpointFound.add(this.onEndpointFound),
      nearbyCommunications.hooks.onEndpointLost.add(this.onEndpointLost),
      nearbyCommunications.hooks.onPayloadReceived.add(this.onPayloadReceived),
    ]
  }

  private removeHooks () {
    this.unsubscribers.forEach(u => u())
    this.unsubscribers = []
  }

  private ping = async () => {
    await this.send('ping')
  }

  private onEndpointFound = async (endpointId: string) => {
    console.log('Client.onEndpointFound', endpointId)
  }

  private onEndpointLost = (endpointId: string) => {
    console.log('Client.onEndpointLost', endpointId)
  }

  private onPayloadReceived = async (msg: string) => {
    try {
      const { event, data, requestId } = JSON.parse(msg) as ServerToClient<any>
      if (requestId) {
        console.log('Client.receive request', requestId, event, data)
        // Send a response to the request
        if (!this.requests[event]) {
          console.warn('Client.onPayloadReceived: no request handler for', event)
          return
        }
        const res = await this.requests[event](data)
        console.log('Client.response', requestId, event, res)
        return this.send('response:' + requestId, res)
      } else {
        console.log('Client.onPayloadReceived', event, data)
        if (this.events[event]) {
          this.events[event].emit(data)
        } else if (event !== 'pong') {
          console.warn('Client.onPayloadReceived: no event handler for', event)
        }
      }
    } catch (err) {
      console.error('Client.onPayloadReceived: error parsing payload', err)
    }
  }

  private onConnectionFound = async (conn: Connection) => {
    console.log('Client.onConnectionFound', conn)
    this.conn = conn
    try {
      await nearbyCommunications.acceptConnection(conn.endpointId)
    } catch (e) {
      this.conn = null
      throw e
    }
  }

  private onConnectionLost = (d: { endpointId: string }) => {
    console.log('Client.onConnectionLost', d)
    this.state = 'disconnected'
  }

  private onConnectionHandler = (d: { endpointId: string }) => {
    console.log('Client.onConnectionHandler', d)
    this.state = 'connected'
    this.onConnection.emit()
  }

  async send<T> (event: string, data?: T) {
    if (this.state !== 'connected') {
      if (event === 'ping') return
      throw new Error('Client cannot send from this state: ' + this.state)
    }
    const payload: ClientToServer<T> = {
      event,
      data,
      authToken: this.conn.authToken,
    }
    return nearbyCommunications.sendPayload(this.conn.endpointId, JSON.stringify(payload))
  }

  on<T> (event: string, cb: (data?: T) => void) {
    if (!this.events[event]) {
      this.events[event] = new Hook()
    }
    return this.events[event].add(cb)
  }

  handle<T, K> (event: string, cb: (data?: T) => Promise<K>) {
    if (this.requests[event]) {
      throw new Error('Client already has a request handler for event: ' + event)
    }
    this.requests[event] = cb
  }
}
