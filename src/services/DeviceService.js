class DeviceService {
  constructor () {
    this.isReady = false
    this.uuid = ''
  }
  setUUID (uuid) {
    this.uuid = uuid
  }
  getUUID () {
    return this.uuid
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

export default new DeviceService()
