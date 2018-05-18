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
    return this.requestQuota(quota)
      .then((grantedBytes) => {
        if (grantedBytes < fileSize) {
          throw new Error('File size exceeds quota.')
        }
        return this.requestFileSystem(requestFileSystemOptions)
      })
      .then((fileSystem) => this.getFileEntry(fileSystem, fileName, getFileEntryOptions))
      .then((fileEntry) => new Promise((resolve, reject) => {
        fileEntry.createWriter(
          function (fileWriter) {
            fileWriter.onwriteend = function () {
              resolve(fileEntry)
            }
            fileWriter.onerror = function (error) {
              reject(error)
            }
            fileWriter.write(file)
          },
          function (error) {
            reject(error)
          })
      })
      )
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
