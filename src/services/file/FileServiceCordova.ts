import DeviceService from '../device/DeviceService'
import md5 from 'js-md5'
import config from '../../config'
import merge from 'lodash/merge'
declare var md5chksum, FileTransfer, cordova
/* global md5chksum, FileTransfer */

const PHOTOS_DIR = 'photos'
const FULL_RES_DIR = 'full-resolution-photos'

enum StorageType {
  PERSISTENT = window.PERSISTENT,
  TEMPORARY = window.TEMPORARY
}

interface FileSystemOptions {
  storageType: StorageType,
  requestedBytes: number
}

interface FileEntryOptions {
  create: boolean
  exclusive: boolean
}

class FileServiceCordova {

  requestFileSystem (options?: FileSystemOptions): Promise<FileSystem> {
    return new Promise((resolve, reject) => {
      options = merge(FileServiceCordova.getDefaultRequestFileSystemOptions(), options)
      DeviceService.isDeviceReady().then(() =>
        window.requestFileSystem(options.storageType as number, options.requestedBytes, resolve, reject)
      )
    })
  }

  getDirectoryEntry (fileSystem: FileSystem, directory: string, options?: FileEntryOptions): Promise<DirectoryEntry> {
    return new Promise((resolve, reject) => {
      options = merge(FileServiceCordova.getDefaultGetDirectoryEntryOptions(), options)
      fileSystem.root.getDirectory(directory, options, resolve, reject)
    })
  }

  getFileEntry (directoryEntry: DirectoryEntry, fileName: string, options?: FileEntryOptions) {
    return new Promise((resolve, reject) => {
      options = merge(FileServiceCordova.getDefaultGetFileEntryOptions(), options)
      directoryEntry.getFile(fileName, options, resolve, reject)
    })
  }

  writeFile (directory, file, fileName, fileSize, storageType = 'PERSISTENT', create = true, exclusive = false) {
    let requestFileSystemOptions = {
      'storageType': (storageType === 'PERSISTENT') ? window.PERSISTENT : window.TEMPORARY,
      'requestedBytes': fileSize
    }
    return this.requestFileSystem(requestFileSystemOptions)
      .then((fileSystem) => this.getDirectoryEntry(fileSystem, directory))
      .then((directoryEntry: DirectoryEntry) => this.getFileEntry(directoryEntry, fileName))
      .then((fileEntry: FileEntry) => new Promise((resolve, reject) => {
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

  /**
   * Copy a file and return the new file entry
   * @param {string} filePath
   * @param {string} dir
   * @param {string} newName
   * @returns {Promise<any>}
   */
  move (filePath: string, dir: string, newName?: string): Promise<FileEntry> {
    return new Promise((resolve, reject) => {
      window.resolveLocalFileSystemURL(filePath, fileEntry => {
        window.resolveLocalFileSystemURL(dir, (dirEntry: DirectoryEntry) => {
          fileEntry.moveTo(dirEntry, newName, (newEntry: FileEntry) => {
            resolve(newEntry)
          }, err => {
            reject('Unable to move file ' + JSON.stringify(err))
          })
        }, err => {
          reject('Directory not found ' + JSON.stringify(err))
        })
      }, err => {
        reject('File not found ' + JSON.stringify(err))
      })
    })
  }

  copy (filePath: string, dir: string, newName?: string): Promise<FileEntry> {
    return new Promise((resolve, reject) => {
      window.resolveLocalFileSystemURL(filePath, fileEntry => {
        window.resolveLocalFileSystemURL(dir, (dirEntry: DirectoryEntry) => {
          fileEntry.copyTo(dirEntry, newName, (newEntry: FileEntry) => {
            resolve(newEntry)
          }, err => {
            reject('Unable to copy file ' + JSON.stringify(err))
          })
        }, err => {
          reject('Directory not found ' + JSON.stringify(err))
        })
      }, err => {
        reject('File not found ' + JSON.stringify(err))
      })
    })
  }

  getFile (filePath): Promise<FileEntry> {
    return new Promise((resolve, reject) => {
      window.resolveLocalFileSystemURL(filePath, entry => {
        resolve(entry as FileEntry)
      }, reject)
    })
  }

  deleteFile (fileEntry) {
    return new Promise((resolve, reject) => {
      fileEntry.remove(resolve, reject)
    })
  }

  // listFiles (): Promise<void> {
  //   return this.requestFileSystem()
  //     .then((fs) => {
  //       return new Promise((resolve, reject) => {
  //         fs.root.getDirectory('/', {create: false}, resolve, reject)
  //       })
  //     }).then((dir: DirectoryEntry) => {
  //       dir.readEntries((entries) => {
  //         entries.forEach((entry) => {
  //           console.log('entry', entry)
  //         })
  //       })
  //     })
  // }

  async getFullResPhotosDir (): Promise<DirectoryEntry> {
    const fs = await this.requestFileSystem()
    return await this.getDirectoryEntry(fs, FULL_RES_DIR)
  }

  async getPhotosDir (): Promise<DirectoryEntry> {
    const fs = await this.requestFileSystem()
    return await this.getDirectoryEntry(fs, PHOTOS_DIR)
  }

  listPhotos () {
    return this.requestFileSystem()
      .then((fileSystem: FileSystem) => this.getDirectoryEntry(fileSystem, PHOTOS_DIR))
      .then((directoryEntry: DirectoryEntry) => {
        return new Promise((resolve, reject) => {
          let reader: DirectoryReader = directoryEntry.createReader()
          reader.readEntries(resolve, reject)
        })
      })
  }

  getPhoto (fileName) {
    return this.requestFileSystem()
      .then((fileSystem) => this.getDirectoryEntry(fileSystem, PHOTOS_DIR))
      .then((directoryEntry) => this.getFileEntry(directoryEntry, fileName, {create: false, exclusive: false}))
  }

  emptyDirectory (directoryEntry) {
    return new Promise((resolve, reject) => {
      directoryEntry
        .createReader()
        .readEntries((entries) => {
          entries.forEach((entry) => {
            entry.remove(
              () => { /* success */ },
              (err) => reject(err))
          })
        })
      resolve()
    })
  }

  download (uri, fileEntry, onDownloadProgress) {
    const promise = new Promise((resolve, reject) => {
      DeviceService.isDeviceReady()
        .then(() => {
          try {
            const fileTransfer = new FileTransfer()
            // @ts-ignore
            promise.cancelDownload = fileTransfer.abort.bind(fileTransfer)
            fileTransfer.onprogress = onDownloadProgress
            const fileURL = fileEntry.toURL()
            fileTransfer.download(uri, fileURL,
              (success) => {
                resolve(fileEntry)
              },
              (err) => {
                if (err.hasOwnProperty('code') && err.code === 4) {
                  let errorObject = {
                    message: 'Operation cancelled by user.'
                  }
                  merge(errorObject, err)
                  reject(errorObject)
                } else {
                  reject(err)
                }
              },
              false, { headers: { 'X-Key': config.xKey } })
          } catch (err) {
            reject(err)
          }
        })
    })
    return promise
  }

  upload (uri, fileEntry, onUploadProgress) {
    const promise = new Promise((resolve, reject) => {
      DeviceService.isDeviceReady()
        .then(() => {
          try {
            const fileTransfer = new FileTransfer()
            const encodedUri = encodeURI(uri)
            // @ts-ignore
            promise.cancelUpload = fileTransfer.abort.bind(fileTransfer)
            fileTransfer.onprogress = onUploadProgress
            const fileURL = fileEntry.toURL()
            fileTransfer.upload(fileURL, encodedUri,
              (success) => {
                resolve()
              },
              (err) => {
                if (err.hasOwnProperty('code') && err.code === 4) {
                  let errorObject = {
                    message: 'Operation cancelled by user.'
                  }
                  merge(errorObject, err)
                  reject(errorObject)
                } else {
                  reject(err)
                }
              },
              { params: { fileName: fileEntry.name }, headers: { 'X-Key': config.xKey } })
          } catch (err) {
            reject(err)
          }
        })
    })
    return promise
  }

  fileFromFileEntry (fileEntry) {
    return new Promise((resolve, reject) => {
      fileEntry.file(resolve, reject)
    })
  }

  calculateMD5HashJS (fileEntry) {
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

  calculateMD5Hash (fileEntry) {
    return new Promise((resolve, reject) => {
      DeviceService.isDeviceReady()
        .then(() => {
          md5chksum.file(fileEntry, resolve, reject)
        })
    })
  }

  countDirectoryFiles (dir: DirectoryEntry): Promise<number> {
    return new Promise(async (resolve, reject) => {
      dir.createReader().readEntries((entries: Entry[]) => {
        resolve(entries.length)
      }, err => {
        reject(err)
      })
    })
  }

  getDirectorySize (dir: DirectoryEntry, includeChildren: boolean = false): Promise<number> {
    return new Promise((resolve, reject) => {
      dir.getMetadata((meta: Metadata) => {
        if (!includeChildren) {
          resolve(meta.size)
        } else {
          // Count size of each entry
          dir.createReader().readEntries((entries: Entry[]) => {
            let size = meta.size
            let processedCount = 0
            let errorCount = 0
            function fileFinished () {
              processedCount++
              if (processedCount >= entries.length) {
                resolve(size)
              }
            }
            entries.forEach(entry => {
              entry.getMetadata((meta: Metadata) => {
                size += meta.size
                fileFinished()
              }, err => {
                errorCount++
                fileFinished()
              })
            })
          })
        }
      }, err => {
        reject(err)
      })
    })
  }

  static getDefaultRequestFileSystemOptions (): FileSystemOptions {
    return {
      storageType: StorageType.PERSISTENT,
      requestedBytes: (1024 * 1024 * 10)
    }
  }

  static getDefaultGetFileEntryOptions (): FileEntryOptions {
    return {
      create: true,
      exclusive: false
    }
  }

  static getDefaultGetDirectoryEntryOptions (): FileEntryOptions {
    return {
      create: true,
      exclusive: false
    }
  }
}

export default FileServiceCordova
