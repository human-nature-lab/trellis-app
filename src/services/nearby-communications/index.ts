const GoogleNearbyConnections = cordova.plugins.GoogleNearbyConnections
export type Strategy = 'mesh' | 'star' | 'point-to-point'

type EndpointCallback = (...args: any[]) => void
type ConnectionCallback = (...args: any[]) => void
type PayloadCallback = (...args: any[]) => void
type ErrorCallback<T = Error> = (err: T) => void

enum Status {
  STATUS_ALREADY_ADVERTISING = 8001,
  // STATUS_ALREADY_DISCOVERING = 8002,
  // STATUS_ALREADY_CONNECTED_TO_ENDPOINT = 8003,
}

function logCallback<T = (...args: any[]) => any>(prefix: string, cb: T): T {
  return function (...args: any[]) {
    console.log(prefix, ...args)
    return cb(...args)
  }
}

export default class NearbyCommunications {
  static async startAdvertising (deviceName: string, strategy: Strategy, serviceId: string) {
    return new Promise((resolve, reject) => {
      GoogleNearbyConnections.startAdvertising(deviceName, strategy, serviceId, logCallback('startAdvertising', resolve), reject)
    })
  }

  static async startDiscovery (strategy: Strategy, serviceId: string) {
    return new Promise((resolve, reject) => {
      GoogleNearbyConnections.startDiscovery(strategy, serviceId, resolve, reject)
    })
  }

  static onEndpointFound (success: EndpointCallback, failure: ErrorCallback) {
    GoogleNearbyConnections.onEndpointFound(logCallback('onEndpointFound', success), failure)
  }

  static onEndpointLost (success: EndpointCallback, failure: ErrorCallback) {
    GoogleNearbyConnections.onEndpointLost(logCallback('onEndpointLost', success), failure)
  }

  static onConnectionFound (success: ConnectionCallback, failure: ErrorCallback) {
    GoogleNearbyConnections.onConnectionFound(logCallback('onConnectionFound', success), failure)
  }

  static onConnectionLost (success: ConnectionCallback, failure: ErrorCallback) {
    GoogleNearbyConnections.onConnectionLost(success, failure)
  }

  static async acceptConnection (endpointId: string) {
    return new Promise((resolve, reject) => {
      GoogleNearbyConnections.acceptConnection(endpointId, logCallback('acceptConnection', resolve), reject)
    })
  }

  static async denyConnection (endpointId: string) {
    return new Promise((resolve, reject) => {
      GoogleNearbyConnections.denyConnection(endpointId, logCallback('denyConnection', resolve), reject)
    })
  }

  static async sendPayload (endpointId: string, payload: string) {
    return new Promise((resolve, reject) => {
      GoogleNearbyConnections.sendPayload(endpointId, payload, logCallback('onSendPayload', resolve), reject)
    })
  }

  static async onPayloadReceived (success: PayloadCallback, failure: ErrorCallback) {
    GoogleNearbyConnections.onPayloadReceived(logCallback('onPayloadReceived', success), failure)
  }
}
