import { DeviceService } from '@/services/device/DeviceService'

class FileServiceMock {
  requestQuota (requestedBytes) {
    return new Promise((resolve, reject) => {
      navigator.webkitPersistentStorage.requestQuota(requestedBytes,
        (grantedBytes) => {
          resolve(grantedBytes)
        },
        (error) => {
          reject(error)
        })
    })
  }

  requestFileSystem (_options) {
    return new Promise((resolve, reject) => {
      let options = _options
      if (!options) {
        options = this.getDefaultRequestFileSystemOptions()
      }
      DeviceService.isDeviceReady().then(
        () => {
          window.requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem
          window.requestFileSystem(options.storageType, options.requestedBytes,
            function (fileSystem) {
              resolve(fileSystem)
            },
            function (error) {
              reject(error)
            })
        }
      )
    })
  }

  getFileEntry (fileSystem, fileName, _options) {
    return new Promise((resolve, reject) => {
      let options = _options
      if (!options) {
        options = this.getDefaultGetFileEntryOptions()
      }
      fileSystem.root.getFile(fileName, options,
        function (fileEntry) {
          resolve(fileEntry)
        },
        function (error) {
          reject(error)
        }
      )
    })
  }

  writeFile (file, fileName, fileSize, storageType = 'PERSISTENT', create = true, exclusive = false) {
    return new Promise((resolve, reject) => {
      let requestFileSystemOptions = {
        'storageType': (storageType === 'PERSISTENT') ? window.PERSISTENT : window.TEMPORARY,
        'requestedBytes': fileSize
      }
      let getFileEntryOptions = {
        'create': create,
        'exclusive': exclusive
      }
      // Round up to the nearest 100MB
      let roundUpToNearest = (1024 * 1024 * 100)
      let quota = Math.ceil(fileSize / roundUpToNearest) * roundUpToNearest
      this.requestQuota(quota)
        .then((grantedBytes) => {
          if (grantedBytes < fileSize) {
            reject('File size exceeds quota.')
          }
          this.requestFileSystem(requestFileSystemOptions)
            .then((fileSystem) => {
              this.getFileEntry(fileSystem, fileName, getFileEntryOptions)
                .then((fileEntry) => {
                  fileEntry.createWriter(
                    function (fileWriter) {
                      fileWriter.onwriteend = function () {
                        resolve('Success')
                      }
                      fileWriter.onerror = function (error) {
                        reject(error)
                      }
                      fileWriter.write(file)
                    },
                    function (error) {
                      reject(error)
                    })
                },
                function (error) {
                  reject(error)
                })
            },
            function (error) {
              reject(error)
            })
        },
        (error) => {
          reject(error)
        })
    })
  }

  static getDefaultRequestFileSystemOptions () {
    return {
      storageType: window.PERSISTENT,
      requestedBytes: (1024 * 1024 * 10)
    }
  }

  static getDefaultGetFileEntryOptions () {
    return {
      create: true,
      exclusive: false
    }
  }
}

export default FileServiceMock
