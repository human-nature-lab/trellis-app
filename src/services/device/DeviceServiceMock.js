class DeviceServiceMock {
  constructor () {
    this.isReady = false
    this.uuid = ''
    // Simulate some time for the device to get ready
    setTimeout(() => {
      this.isReady = true
      this.uuid = '3c586040f3f7a483'
    }, 500)
  }
  getUUID () {
    return this.uuid
  }
  getPlatform () {
    return 'Android'
  }
  setDeviceReady (isReady) {
    this.isReady = isReady
  }
  getFreeDiskSpace () {
    return 4000000000
  }
  isDeviceReady () {
    return new Promise(resolve => {
      const checkReady = () => {
        if (this.isReady) {
          resolve(true)
        } else {
          setTimeout(checkReady)
        }
      }
      checkReady()
    })
  }
}

export default DeviceServiceMock
