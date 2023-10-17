import Vue from 'vue'
import NearbyCommunications, { Connection, StatusCode } from '.'
import { Hook } from '../../lib/Hook'

export class Server {
  pending: Record<string, Connection> = {}
  connections: Record<string, Connection> = {}
  state = 'none'
  messages = new Hook<[Connection, string]>()
  private intervalId = 0

  constructor (public serverName: string, public serviceId: string) {
    this.addHooks()
  }

  private addHooks () {
    NearbyCommunications.hooks.onConnection.add(this.onConnection)
    NearbyCommunications.hooks.onConnectionLost.add(this.onConnectionLost)
    NearbyCommunications.hooks.onConnectionFound.add(this.onConnectionFound)
    NearbyCommunications.hooks.onPayloadReceived.add(this.onPayloadReceived)
  }

  private removeHooks () {
    NearbyCommunications.hooks.onConnection.remove(this.onConnection)
    NearbyCommunications.hooks.onConnectionLost.remove(this.onConnectionLost)
    NearbyCommunications.hooks.onConnectionFound.remove(this.onConnectionFound)
    NearbyCommunications.hooks.onPayloadReceived.remove(this.onPayloadReceived)
  }

  private onConnection = (connection: Connection) => {
    console.log('Server.onConnection', connection)
  }

  private onConnectionLost = (connection: Pick<Connection, 'endpointId'>) => {
    console.log('Server.onConnectionLost', connection)
    Vue.delete(this.connections, connection.endpointId)
    Vue.delete(this.pending, connection.endpointId)
  }

  private onConnectionFound = async (connection: Connection) => {
    // TODO: check if we should accept the connection
    Vue.set(this.pending, connection.endpointId, connection)
    try {
      await NearbyCommunications.acceptConnection(connection.endpointId)
      Vue.set(this.connections, connection.endpointId, connection)
    } catch (err) {
      console.error('NearbyCommunications.acceptConnection', err)
    } finally {
      Vue.delete(this.pending, connection.endpointId)
    }
  }

  private onPayloadReceived = (connection: Connection, payload: string) => {
    console.log('Server.onPayloadReceived', connection, payload)
    this.messages.emit(connection, payload)
  }

  async start () {
    try {
      await NearbyCommunications.startAdvertising(this.serverName, 'star', this.serviceId)
      this.intervalId = setInterval(this.tick, 1000)
      this.state = 'advertising'
    } catch (err) {
      if (err.code === StatusCode.ALREADY_ADVERTISING) {
        this.state = 'advertising'
      } else {
        throw err
      }
    }
  }

  async stop () {
    try {
      clearInterval(this.intervalId)
      this.removeHooks()
      await NearbyCommunications.stopAdvertising()
      this.connections = {}
      this.pending = {}
    } finally {
      this.state = 'none'
    }
  }

  tick = async () => {
    for (const endpointId in this.connections) {
      await NearbyCommunications.sendPayload(endpointId, 'tick')
    }
  }

  send (msg: string) {
    const payloads = []
    for (const id in this.connections) {
      const connection = this.connections[id]
      payloads.push(NearbyCommunications.sendPayload(connection.endpointId, msg))
    }
    this.messages.emit(null, msg)
    return Promise.all(payloads)
  }
}
