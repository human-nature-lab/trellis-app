import DeviceService from '../device'
import md5 from 'js-md5'
import { merge } from 'lodash'
import CancellablePromise from '../../classes/CancellablePromise'
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

  getFileEntry (directoryEntry: DirectoryEntry, fileName: string, options?: FileEntryOptions): Promise<FileEntry> {
    return new Promise((resolve, reject) => {
      options = merge(FileServiceCordova.getDefaultGetFileEntryOptions(), options)
      directoryEntry.getFile(fileName, options, resolve, reject)
    })
  }

  writeFile (directory: string, file: File, fileName: string, fileSize: number, storageType = 'PERSISTENT', create = true, exclusive = false) {
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
  async move (filePath: string, dir: string, newName?: string): Promise<FileEntry> {
    console.log('move', filePath, dir, newName)
    const fileEntry = await this.localUrl(filePath) as FileEntry
    const dirEntry = await this.localUrl(dir) as DirectoryEntry
    console.log('move', fileEntry, dirEntry, newName)
    return this.moveTo(fileEntry, dirEntry, newName)
  }

  moveTo (file: FileEntry, toDir: DirectoryEntry, name: string): Promise<FileEntry> {
    return new Promise((resolve, reject) => {
      file.moveTo(toDir, name, (newEntry: FileEntry) => {
        resolve(newEntry)
      }, err => {
        reject('Unable to move file ' + JSON.stringify(err))
      })
    })
  }

  dirname (path: string): string {
    const parts = path.split('/')
    if (!parts.length) return path
    let last = parts[parts.length - 1]
    return last.length ? parts.slice(0, -1).join('/') : parts.join('/')
  }

  basename (path: string): string {
    let parts = path.split('/')
    return parts.length ? parts[parts.length - 1] : ''
  }
  
  async moveUrl (fromURI: string, toURI: string): Promise<FileEntry> {
    const fileEntry = await this.localUrl(fromURI) as FileEntry
    const dirUri = this.dirname(toURI)
    const newName = this.basename(toURI)
    console.log(fromURI, toURI, dirUri, newName)
    const dirEntry = await this.localUrl(dirUri) as DirectoryEntry
    return this.moveTo(fileEntry, dirEntry, newName)
  }
  
  localUrl (filePath: string): Promise<FileEntry|DirectoryEntry> {
    return new Promise((resolve, reject) => {
      window.resolveLocalFileSystemURL(filePath, (entry: FileEntry | DirectoryEntry) => {
        resolve(entry)
      }, reject)
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

  getFile (filePath: string): Promise<FileEntry> {
    return new Promise(async (resolve, reject) => {
      const path = cordova.file.dataDirectory + filePath
      console.log('getFile', path)
      const fs = await this.requestFileSystem()
      fs.root.getFile(filePath, {create: false, exclusive: false}, (file: FileEntry) => {
      }, reject)
    })
  }
  
  async existsUrl (file: string): Promise<boolean> {
    try {
      await this.localUrl(file)
      return true
    } catch (err) {
      return err.code === 1
    }
  }
  
  async deleteUrl (file: string) {
    const entry = await this.localUrl(file) as FileEntry
    return this.deleteFile(entry)
  }

  deleteFile (fileEntry: FileEntry): Promise<void> {
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
    return this.getDirectoryEntry(fs, FULL_RES_DIR)
  }

  async getPhotosDir (): Promise<DirectoryEntry> {
    const fs = await this.requestFileSystem()
    return this.getDirectoryEntry(fs, PHOTOS_DIR)
  }

  listPhotos () {
    return this.getPhotosDir()
      .then((directoryEntry: DirectoryEntry) => {
        return new Promise((resolve, reject) => {
          let reader: DirectoryReader = directoryEntry.createReader()
          reader.readEntries(resolve, reject)
        })
      })
  }

  async getPhoto (fileName): Promise<FileEntry> {
    const pDir = await this.getPhotosDir()
    return this.getFileEntry(pDir, fileName, {create: false, exclusive: false})
  }

  emptyDirectory (directoryEntry) {
    return new Promise((resolve, reject) => {
      directoryEntry
        .createReader()
        .readEntries((entries) => {
          if (entries.length === 0) {
            // Nothing to remove, just resolve
            resolve()
          }
          let removedEntries = 0
          entries.forEach((entry) => {
            entry.remove(
              () => {
                removedEntries++
                if (removedEntries === entries.length) {
                  resolve()
                }
              },
              (err) => reject(err))
          })
        }, reject)
    })
  }

  download (uri, fileEntry, onDownloadProgress, authHeader?: string) {
    const promise = new Promise((resolve, reject) => {
      DeviceService.getDeviceKey()
        .then(deviceKey => {
          try {
            const fileTransfer = new FileTransfer()
            // @ts-ignore
            promise.cancelDownload = fileTransfer.abort.bind(fileTransfer)
            fileTransfer.onprogress = onDownloadProgress
            const fileURL = fileEntry.toURL()
            const headers = {
              'X-Key': deviceKey
            }
            if (authHeader) {
              headers['Authorization'] = authHeader
            }
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
              false, { headers })
          } catch (err) {
            reject(err)
          }
        })
    })
    return promise
  }

  upload (uri: string, fileEntry: FileEntry, onUploadProgress: () => any, authHeader?: string) {
    const promise = new Promise((resolve, reject) => {
      DeviceService.getDeviceKey()
        .then(deviceKey => {
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
              { params: { fileName: fileEntry.name }, headers: { 'X-Key': deviceKey, 'Authorization': authHeader } })
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

  /**
   * Get the size of a file specified by a string
   * @param {string} filePath
   * @returns {Promise<number>}
   */
  getFileSize (filePath: string): Promise<number> {
    return new Promise(async (resolve, reject) => {
      try {
        let file: FileEntry = await this.getFile(filePath)
        file.getMetadata(meta => {
          resolve(meta.size)
        }, err => {
          reject(err)
        })
      } catch (err) {
        reject(err)
      }
    })
  }

  getDirectorySize (dir: DirectoryEntry, includeChildren: boolean = false): CancellablePromise<number> {
    let isCancelled = false
    return new CancellablePromise((resolve, reject) => {
      dir.getMetadata((meta: Metadata) => {
        if (!includeChildren) {
          resolve(meta.size)
        } else {
          // Count size of each entry
          dir.createReader().readEntries((entries: Entry[]) => {
            const totalCount = entries.length
            let size = meta.size
            let processedCount = 0
            let errorCount = 0
            const batchSize = 500
            function processBatch () {
              const batchEntries: Entry[] = entries.splice(0, batchSize)
              const totalBatchCount = batchEntries.length
              let batchCount = 0
              function checkBatchFinished () {
                if (processedCount >= totalCount || isCancelled) {
                  resolve(size)
                } else if (batchCount >= totalBatchCount) {
                  processBatch()
                }
              }
              checkBatchFinished()
              batchEntries.forEach(entry => {
                entry.getMetadata((meta: Metadata) => {
                  size += meta.size
                  processedCount++
                  batchCount++
                  checkBatchFinished()
                }, err => {
                  errorCount++
                  processedCount++
                  batchCount++
                  checkBatchFinished()
                })
              })
            }
            processBatch()
          })
        }
      }, err => {
        reject(err)
      })
    }, () => {
      console.log('cancelling')
      isCancelled = true
    })
  }

  /**
   * Iterate over all of the entries in a directory
   * @param dir
   * @param cb
   */
  async entriesForEach (dir: DirectoryEntry, cb: (entry: FileEntry, index?: number) => any): Promise<void> {
    const entries = await this.readEntries(dir)
    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i]
      await cb(entry, i)
    }
  }

  /**
   * Read all file entries in a directory as a promise
   * @param dir
   */
  readEntries (dir: DirectoryEntry): Promise<FileEntry[]> {
    return new Promise((resolve, reject) => {
      // @ts-ignore
      dir.createReader().readEntries(resolve, reject)
    })
  }

  /**
   * Read a file as Data URL promise wrapper
   * @param entry
   */
  readFileAsDataURL (entry: FileEntry): Promise<string> {
    return new Promise((resolve, reject) => {
      entry.file((blob) => {
        const reader = new FileReader()
        reader.onloadend = function () {
          resolve(reader.result as string)
        }
        reader.onerror = function(err) {
          reject(err)
        }
        reader.readAsDataURL(blob)
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
