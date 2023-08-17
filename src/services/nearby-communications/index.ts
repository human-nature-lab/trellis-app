import { Mutex } from 'async-mutex'
import { Hook } from '@/lib/Hook'

const GoogleNearbyConnections = cordova.plugins.GoogleNearbyConnections
export type Strategy = 'mesh' | 'star' | 'point-to-point'

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
  MISSING_PERMISSION_BLUETOOTH = 8030,
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

function rejectParsed (cb: (err: NCError | Error) => void) {
  return function (msg: string | Error) {
    if (msg instanceof Error) {
      return cb(msg)
    }
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
    onConnection: new Hook<[Connection]>(),
    onConnectionFound: new Hook<[Connection]>(),
    onConnectionLost: new Hook<[Connection]>(),
    onPayloadReceived: new Hook(),
  }

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
      }, (msg: string) => {
        console.error('NearbyCommunications.onEndpointFound', msg)
        const err = parseError(msg)
        this.hooks.onError.emit(err)
      })
      GoogleNearbyConnections.onConnection((...args: any[]) => {
        console.log('NearbyCommunications.onConnection', ...args)
        this.hooks.onConnection.emit(...args)
      }, (msg: string) => {
        console.error('NearbyCommunications.onConnection', msg)
        const err = parseError(msg)
        this.hooks.onError.emit(err)
      })
      GoogleNearbyConnections.onConnectionFound((...args: any[]) => {
        console.log('NearbyCommunications.onConnectionFound', ...args)
        this.hooks.onConnectionFound.emit(...args)
      }, (msg: string) => {
        console.error('NearbyCommunications.onConnectionFound', msg)
        const err = parseError(msg)
        this.hooks.onError.emit(err)
      })
      GoogleNearbyConnections.onConnectionLost((msg: string) => {
        console.log('NearbyCommunications.onConnectionLost', msg)
        const endpointId = msg.split(' ')[0]
        this.hooks.onConnectionLost.emit({ endpointId })
      }, (msg: string) => {
        console.error('NearbyCommunications.onConnectionLost', msg)
        const err = parseError(msg)
        this.hooks.onError.emit(err)
      })
      GoogleNearbyConnections.onEndpointFound((...args: any[]) => {
        console.log('NearbyCommunications.onEndpointFound', ...args)
        this.hooks.onEndpointFound.emit(...args)
      }, (msg: string) => {
        console.error('NearbyCommunications.onEndpointFound', msg)
        const err = parseError(msg)
        this.hooks.onError.emit(err)
      })
      GoogleNearbyConnections.onEndpointLost((...args: any[]) => {
        console.log('NearbyCommunications.onEndpointLost', ...args)
        this.hooks.onEndpointLost.emit(...args)
      }, (msg: string) => {
        console.error('NearbyCommunications.onEndpointLost', msg)
        const err = parseError(msg)
        this.hooks.onError.emit(err)
      })
      GoogleNearbyConnections.onPayloadReceived((...args: any[]) => {
        console.log('NearbyCommunications.onPayloadReceived', ...args)
        this.hooks.onPayloadReceived.emit(...args)
      }, (msg: string) => {
        console.error('NearbyCommunications.onPayloadReceived', msg)
        const err = parseError(msg)
        this.hooks.onError.emit(err)
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
        rejectParsed(reject),
      )
    })
  }

  async stopDiscovery () {
    await this.init()
    return new Promise((resolve, reject) => {
      GoogleNearbyConnections.stopDiscovery(
        logCallback('NearbyCommunications.stopDiscovery', resolve),
        rejectParsed(reject),
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
        rejectParsed(reject),
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
        rejectParsed(reject),
      )
    })
  }

  sendPayload (endpointId: string, payload: string) {
    if (!this.initialized) {
      throw new Error('NearbyCommunications not initialized')
    }
    return new Promise((resolve, reject) => {
      GoogleNearbyConnections.sendPayload(
        endpointId,
        payload,
        logCallback('NearbyCommunications.onSendPayload', resolve),
        rejectParsed(reject),
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
        rejectParsed(reject),
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
        rejectParsed(reject),
      )
    })
  }
}

export default new NearbyCommunications()
