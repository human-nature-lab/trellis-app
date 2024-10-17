import { Mutex } from 'async-mutex'
import { Hook } from '@/lib/Hook'

const GoogleNearbyConnections = cordova.plugins.GoogleNearbyConnections
export type Strategy = 'mesh' | 'star' | 'point-to-point'

export type ClientEvent<T> = {
  data: T
  event: string
}

export type ServerEvent<T> = ClientEvent<T> & {
  authToken: string
}

export type Connection = {
  authToken: string
  endpointId: string
  endpointName: string
}

export enum StatusCode {
  ALREADY_ADVERTISING = 8001,
  ALREADY_DISCOVERING = 8002,
  ALREADY_CONNECTED_TO_ENDPOINT = 8003,
  OUT_OF_ORDER_API_CALL = 8009,
  ENDPOINT_UNKNOWN = 8011,
  STATUS_ENDPOINT_IO_ERROR = 8012,
  MISSING_PERMISSION_BLUETOOTH = 8030,
  STATUS_UNKNOWN_STATUS_CODE = 8037,
}

export type NCError = {
  code: StatusCode
  message: string
}

function logCallback<T = (...args: any[]) => any>(prefix: string, cb: T): T {
  return function (...args: any[]) {
    console.log(prefix, ...args)
    return cb(...args)
  }
}

function rejectParsed (name: string, cb: (err: NCError | Error) => void) {
  return function (msg: string | Error) {
    if (msg instanceof Error) {
      return cb(msg)
    }
    console.log('rejectParsed', name, msg)
    cb(parseError(msg))
  }
}

function parseError (msg: string): NCError {
  const code = parseInt(msg.split(':')[0])
  return {
    code,
    message: msg,
  }
}

export class NearbyCommunications {
  private initialized = false
  private mut = new Mutex()
  hooks = {
    onError: new Hook<[Error]>(),
    onEndpointFound: new Hook(),
    onEndpointLost: new Hook(),
    onConnection: new Hook<[Pick<Connection, 'endpointId'>]>(),
    onConnectionFound: new Hook<[Connection]>(),
    onConnectionLost: new Hook<[Pick<Connection, 'endpointId'>]>(),
    onPayloadReceived: new Hook(),
    events: {} as Record<string, Hook<any>>,
  }

  endpointConnectionMap = new Map<string, Connection>()
  authConnectionMap = new Map<string, Connection>()

  private async init () {
    if (this.initialized) {
      return
    }
    return this.mut.runExclusive(async () => {
      if (this.initialized) {
        return
      }
      GoogleNearbyConnections.onEndpointFound((...args: any[]) => {
        console.log('NearbyCommunications.onEndpointFound', ...args)
        this.hooks.onEndpointFound.emit(...args)
      }, (...args: any[]) => {
        console.error('NearbyCommunications.onEndpointFound', args)
        const err = parseError(args[0])
        this.hooks.onError.emit(...args)
      })
      GoogleNearbyConnections.onConnection((msg: string) => {
        console.log('NearbyCommunications.onConnection', msg)
        const endpointId = msg.replace('Connected to', '').trim()
        this.hooks.onConnection.emit({ endpointId })
      }, (...args: any[]) => {
        console.error('NearbyCommunications.onConnection', args)
        const err = parseError(args[0])
        this.hooks.onError.emit(...args)
      })
      GoogleNearbyConnections.onConnectionFound((conn: Connection) => {
        console.log('NearbyCommunications.onConnectionFound', conn)
        this.endpointConnectionMap.set(conn.endpointId, conn)
        this.hooks.onConnectionFound.emit(conn)
      }, (...args: any[]) => {
        console.error('NearbyCommunications.onConnectionFound', args)
        const err = parseError(args[0])
        this.hooks.onError.emit(...args)
      })
      GoogleNearbyConnections.onConnectionLost((msg: string) => {
        console.log('NearbyCommunications.onConnectionLost', msg)
        const endpointId = msg.split(' ')[0]
        this.hooks.onConnectionLost.emit({ endpointId })
      }, (...args: any[]) => {
        console.error('NearbyCommunications.onConnectionLost', args)
        const err = parseError(args[0])
        this.hooks.onError.emit(...args)
      })
      GoogleNearbyConnections.onEndpointFound((...args: any[]) => {
        console.log('NearbyCommunications.onEndpointFound', ...args)
        this.hooks.onEndpointFound.emit(...args)
      }, (...args: any[]) => {
        console.error('NearbyCommunications.onEndpointFound', args)
        const err = parseError(args[0])
        this.hooks.onError.emit(...args)
      })
      GoogleNearbyConnections.onEndpointLost((...args: any[]) => {
        console.log('NearbyCommunications.onEndpointLost', ...args)
        this.hooks.onEndpointLost.emit(...args)
      }, (...args: any[]) => {
        console.error('NearbyCommunications.onEndpointLost', args)
        const err = parseError(args[0])
        this.hooks.onError.emit(...args)
      })
      GoogleNearbyConnections.onPayloadReceived((msg: string) => {
        // console.log('NearbyCommunications.onPayloadReceived', msg)
        this.hooks.onPayloadReceived.emit(msg)
        if (msg.startsWith('sevt:')) {
          const { event, data } = JSON.parse(msg.slice(5))
          if (this.hooks.events[event]) {
            this.hooks.events[event].emit(data)
          }
        } else if (msg.startsWith('cevt:')) {
          const { event, data, authToken } = JSON.parse(msg.slice(5))
          if (this.hooks.events[event]) {
            this.hooks.events[event].emit(data, authToken)
          }
        }
      }, (...args: any[]) => {
        console.error('NearbyCommunications.onPayloadReceived', args)
        const err = parseError(args[0])
        this.hooks.onError.emit(...args)
      })
      this.initialized = true
    })
  }

  async startAdvertising (deviceName: string, strategy: Strategy, serviceId: string) {
    await this.init()
    return new Promise<void>((resolve, reject) => {
      GoogleNearbyConnections.startAdvertising(
        deviceName,
        strategy,
        serviceId,
        logCallback('NearbyCommunications.startAdvertising', resolve),
        msg => {
          const err = parseError(msg)
          if (err.code === StatusCode.ALREADY_ADVERTISING) {
            resolve()
          } else {
            reject(err)
          }
        },
      )
    })
  }

  async stopAdvertising () {
    await this.init()
    return new Promise((resolve, reject) => {
      GoogleNearbyConnections.stopAdvertising(
        logCallback('NearbyCommunications.stopAdvertising', resolve),
        rejectParsed('NearbyCommunications.stopAdvertising', reject),
      )
    })
  }

  async stopDiscovery () {
    await this.init()
    return new Promise((resolve, reject) => {
      GoogleNearbyConnections.stopDiscovery(
        logCallback('NearbyCommunications.stopDiscovery', resolve),
        rejectParsed('NearbyCommunications.stopDiscovery', reject),
      )
    })
  }

  async startDiscovery (strategy: Strategy, serviceId: string) {
    await this.init()
    return new Promise<void>((resolve, reject) => {
      GoogleNearbyConnections.startDiscovery(
        strategy,
        serviceId,
        logCallback('NearbyCommunications.startDiscovery', resolve),
        msg => {
          const err = parseError(msg)
          if (err.code === StatusCode.ALREADY_DISCOVERING) {
            resolve()
          } else {
            console.error('NearbyCommunications.startDiscovery', msg)
            reject(err)
          }
        },
      )
    })
  }

  acceptConnection (endpointId: string) {
    if (!this.initialized) {
      throw new Error('NearbyCommunications not initialized')
    }
    return new Promise((resolve, reject) => {
      GoogleNearbyConnections.acceptConnection(
        endpointId,
        logCallback('NearbyCommunications.acceptConnection', resolve),
        rejectParsed('NearbyCommunications.acceptConnection', reject),
      )
    })
  }

  denyConnection (endpointId: string) {
    if (!this.initialized) {
      throw new Error('NearbyCommunications not initialized')
    }
    return new Promise((resolve, reject) => {
      GoogleNearbyConnections.denyConnection(
        endpointId,
        logCallback('NearbyCommunications.denyConnection', resolve),
        rejectParsed('NearbyCommunications.denyConnection', reject),
      )
    })
  }

  sendPayload (endpointId: string, payload: string) {
    if (!this.initialized) {
      throw new Error('NearbyCommunications not initialized')
    }
    // console.log('NearbyCommunications.sendPayload', endpointId, 'sending', payload)
    return new Promise((resolve, reject) => {
      GoogleNearbyConnections.sendPayload(
        endpointId,
        payload,
        resolve,
        err => {
          console.error('NearbyCommunications.onSendPayload', endpointId, payload)
          console.error(err)
          reject(err)
        },
      )
    })
  }

  stopAllEndpoints () {
    if (!this.initialized) {
      throw new Error('NearbyCommunications not initialized')
    }
    return new Promise((resolve, reject) => {
      GoogleNearbyConnections.stopAllEndpoints(
        logCallback('NearbyCommunications.denyConnection', resolve),
        rejectParsed('NearbyCommunications.denyConnection', reject),
      )
    })
  }

  disconnectFromEndpoint (endpointId: string) {
    if (!this.initialized) {
      throw new Error('NearbyCommunications not initialized')
    }
    return new Promise((resolve, reject) => {
      GoogleNearbyConnections.disconnectFromEndpoint(
        endpointId,
        logCallback('NearbyCommunications.disconnectFromEndpoint', resolve),
        rejectParsed('NearbyCommunications.disconnectFromEndpoint', reject),
      )
    })
  }
}

export default new NearbyCommunications()
