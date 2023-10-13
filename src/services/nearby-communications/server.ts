import { Hook } from '@/lib/Hook'
import nearbyCommunications, { Connection, Strategy } from '.'
import { uniqueId } from 'lodash'

export type ServerToClient<T> = {
  event: string
  data: T
  requestId?: string
}

export type ClientToServer<T> = ServerToClient<T> & {
  authToken: string
}
export class ServerSocket {
  events = {} as Record<string, Hook>
  state = 'disconnected'
  onDisconnect = new Hook()
  latestPing = Date.now()
  activeTimers = new Set<number>()
  public id: string

  constructor (public connection: Connection) {
    this.id = connection.authToken
  }

  async send<T> (event: string, data?: T): Promise<void> {
    const payload = { event, data } as ServerToClient<T>
    await nearbyCommunications.sendPayload(this.connection.endpointId, JSON.stringify(payload))
  }

  async request<T, K> (event: string, data?: T, requestTimeout = 10000): Promise<K> {
    const requestId = uniqueId()
    const payload = { event, data, requestId } as ServerToClient<T>
    return new Promise((resolve, reject) => {
      let isResolved = false
      // start listening for response before sending request
      const unsub = this.on('response:' + requestId, (data: K) => {
        console.log('ServerSocket.response', requestId, event, data)
        unsub()
        isResolved = true
        resolve(data)
      })
      console.log('ServerSocket.request', requestId, event, payload)
      nearbyCommunications.sendPayload(this.connection.endpointId, JSON.stringify(payload)).then(() => {
        const timerId = setTimeout(() => {
          if (!isResolved) {
            unsub()
            this.activeTimers.delete(timerId)
            reject(new Error('Request timed out'))
          }
        }, requestTimeout) as unknown as number
        this.activeTimers.add(timerId)
      }).catch(err => {
        console.error('ServerSocket.request: error sending payload', err)
        unsub()
        reject(err)
      })
    })
  }

  on<T> (event: string, callback: (data: T) => void) {
    if (!this.events[event]) {
      this.events[event] = new Hook()
    }
    return this.events[event].add(callback)
  }

  off<T> (event: string, callback: (data: T) => void) {
    if (this.events[event]) {
      this.events[event].remove(callback)
    }
  }

  emit<T> (event: string, data?: T) {
    if (this.events[event]) {
      this.events[event].emit(data)
    }
  }

  disconnect () {
    this.onDisconnect.emit()
    this.activeTimers.forEach(t => clearTimeout(t))
    return nearbyCommunications.disconnectFromEndpoint(this.connection.endpointId)
  }
}
export class Server {
  private endpointConnectionMap = new Map<string, Connection>()
  private authSocketMap = new Map<string, ServerSocket>()
  private unsubscribers = [] as (() => void)[]
  state = 'disconnected'
  onConnection = new Hook<[ServerSocket]>()
  connAcceptor: (conn: Connection) => boolean = () => true

  constructor (public deviceName: string, public serviceId: string, public strategy: Strategy) {}

  async connect () {
    if (this.state === 'disconnected') {
      this.state = 'starting'
      try {
        this.addHooks()
        await nearbyCommunications.startAdvertising(this.deviceName, this.strategy, this.serviceId)
        this.state = 'started'
      } catch (err) {
        this.removeHooks()
        this.state = 'disconnected'
        throw err
      }
    } else {
      throw new Error('Server cannot connect while already connected')
    }
  }

  async disconnect () {
    this.state = 'disconnecting'
    try {
      for (const socket of this.authSocketMap.values()) {
        await socket.disconnect()
      }
      await nearbyCommunications.stopAdvertising()
      this.authSocketMap.clear()
      this.endpointConnectionMap.clear()
      this.removeHooks()
      this.state = 'disconnected'
      this.endpointConnectionMap.clear()
      this.authSocketMap.clear()
    } catch (err) {
      this.state = 'started'
      throw err
    }
  }

  async send<T> (event: string, data?: T) {
    for (const s of this.authSocketMap.values()) {
      await s.send(event, data)
    }
  }

  async broadcast<T> (event: string, data?: T) {
    return this.send(event, data)
  }

  private addHooks () {
    this.unsubscribers = [
      nearbyCommunications.hooks.onConnection.add(this.onConnectionHandler),
      nearbyCommunications.hooks.onConnectionLost.add(this.onConnectionLost),
      nearbyCommunications.hooks.onConnectionFound.add(this.onConnectionFound),
      nearbyCommunications.hooks.onPayloadReceived.add(this.onPayloadReceived),
    ]
  }

  private removeHooks () {
    this.unsubscribers.forEach(u => u())
    this.unsubscribers = []
    this.onConnection = new Hook()
  }

  private onConnectionHandler = (d: { endpointId: string }) => {
    console.log('Server.onConnection', d)
    const conn = this.endpointConnectionMap.get(d.endpointId)
    if (!conn) {
      throw new Error('Connection not found for endpoint:' + d.endpointId)
    }
    const socket = new ServerSocket(conn)
    this.authSocketMap.set(conn.authToken, socket)
    socket.state = 'connected'
    this.onConnection.emit(socket)
  }

  private onConnectionLost = (connection: Pick<Connection, 'endpointId'>) => {
    console.log('Server.onConnectionLost', connection)
    const conn = this.endpointConnectionMap.get(connection.endpointId)
    if (!conn) {
      throw new Error('Connection not found for endpoint:' + connection.endpointId)
    }
    const socket = this.authSocketMap.get(conn.authToken)
    if (!socket) {
      throw new Error('Socket not found for authToken:' + conn.authToken)
    }
    socket.onDisconnect.emit()
    this.endpointConnectionMap.delete(connection.endpointId)
    this.authSocketMap.delete(connection.endpointId)
  }

  private onConnectionFound = async (connection: Connection) => {
    if (this.connAcceptor(connection)) {
      this.endpointConnectionMap.set(connection.endpointId, connection)
      try {
        await nearbyCommunications.acceptConnection(connection.endpointId)
      } catch (e) {
        this.endpointConnectionMap.delete(connection.endpointId)
        throw e
      }
    } else {
      await nearbyCommunications.denyConnection(connection.endpointId)
    }
  }

  private onPayloadReceived = async (msg: string) => {
    const payload: ClientToServer<unknown> = JSON.parse(msg)
    const socket = this.authSocketMap.get(payload.authToken)
    if (!socket) {
      throw new Error('Socket not found for authToken:' + payload.authToken)
    }
    if (payload.event === 'ping') {
      socket.latestPing = Date.now()
      await socket.send('pong')
    }
    socket.emit(payload.event, payload.data)
  }
}
