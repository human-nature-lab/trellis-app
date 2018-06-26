class DeviceServiceCordova {
  constructor () {
    this.isReady = false
    this.uuid = undefined
    this.platform = undefined
    document.addEventListener('deviceready', () => { this.isReady = true }, false)
  }
  getUUID () {
    return new Promise((resolve) => {
      if (this.uuid !== undefined) {
        resolve(this.uuid)
      } else {
        this.isDeviceReady()
          .then(() => {
            this.uuid = device.uuid
            resolve(this.uuid)
          })
      }
    })
  }
  getPlatform () {
    return new Promise((resolve) => {
      if (this.platform !== undefined) {
        resolve(this.platform)
      } else {
        this.isDeviceReady()
          .then(() => {
            this.platform = device.platform
            resolve(this.platform)
          })
      }
    })
  }
  getFreeDiskSpace () {
    return new Promise((resolve, reject) => {
      this.isDeviceReady()
        .then(() => {
          cordova.exec((result) => {
            resolve(result)
          },
          (error) => reject(error))
        })
    })
  }
  setDeviceReady (isReady) {
    this.isReady = isReady
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

export default DeviceServiceCordova
