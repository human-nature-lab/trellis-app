import DeviceService from '../device/DeviceService'
import md5 from 'js-md5'

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

  getDirectoryEntry (fileSystem, directory, _options) {
    return new Promise((resolve, reject) => {
      let options = _options
      if (!options) {
        options = this.getDefaultGetDirectoryEntryOptions()
      }
      fileSystem.root.getDirectory(directory, options,
        (directoryEntry) => resolve(directoryEntry),
        (error) => reject(error)
      )
    })
  }

  getFileEntry (directoryEntry, fileName, _options) {
    return new Promise((resolve, reject) => {
      let options = _options
      if (!options) {
        options = this.getDefaultGetFileEntryOptions()
      }
      directoryEntry.getFile(fileName, options,
        (fileEntry) => resolve(fileEntry),
        (error) => reject(error)
      )
    })
  }

  writeFile (directory, file, fileName, fileSize, storageType = 'PERSISTENT', create = true, exclusive = false) {
    let requestFileSystemOptions = {
      'storageType': (storageType === 'PERSISTENT') ? window.PERSISTENT : window.TEMPORARY,
      'requestedBytes': fileSize
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
      .then((fileSystem) => this.getDirectoryEntry(fileSystem, directory))
      .then((directoryEntry) => this.getFileEntry(directoryEntry, fileName))
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

  listFiles () {
    this.requestFileSystem()
      .then((fs) => {
        fs.root.getDirectory('/')
          .readEntries((entries) => {
            entries.forEach((entry) => {
              console.log('entry', entry)
            })
          })
      })
  }

  calculateMD5Hash (fileEntry) {
    return new Promise((resolve, reject) => {
      DeviceService.isDeviceReady()
        .then(() => {
          fileEntry.file((file) => {
            let reader = new FileReader()
            reader.onloadend = function () {
              let file = this.result
              let md5Hash = md5(file)
              resolve(md5Hash)
            }
            reader.onerror = function (error) {
              reject(error)
            }
            reader.readAsArrayBuffer(file)
          })
        })
    })
  }

  getDefaultRequestFileSystemOptions () {
    return {
      storageType: window.PERSISTENT,
      requestedBytes: (1024 * 1024 * 10)
    }
  }

  getDefaultGetFileEntryOptions () {
    return {
      create: true,
      exclusive: false
    }
  }

  getDefaultGetDirectoryEntryOptions () {
    return {
      create: true,
      exclusive: false
    }
  }
}

export default FileServiceMock
