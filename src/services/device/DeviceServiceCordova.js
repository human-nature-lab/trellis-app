import Vue from 'vue'
class DeviceServiceCordova {
  constructor () {
    this.isReady = false
    this.uuid = ''
    Vue.cordova.on('deviceready', () => {
      this.isReady = true
      this.uuid = this.cordova.device.uuid
    })
  }
  getUUID () {
    return this.uuid
  }
  getPlatform () {
    return Vue.cordova.device.platform
  }
  setDeviceReady (isReady) {
    this.isReady = isReady
  }
  isDeviceReady () {
    console.log('checking isDevice Ready')
    return new Promise(resolve => {
      const checkReady = () => {
        if (this.isReady) {
          console.log('device is ready')
          resolve(true)
        } else {
          setTimeout(checkReady)
        }
      }
      checkReady()
    })
  }
}

export default DeviceServiceCordova