import { CancelPromise } from '@/types/CancelPromise'
import { FSFileEntry, convert } from './file'

export type ProgressHandler = (evt: { loaded: number, total: number, lengthComputable: boolean }) => void

export class filetransfer {
  static upload (
    serverURL: string,
    fileURL: string,
    opts?: FileUploadOptions,
    onProgress?: ProgressHandler,
    trustAllHosts = false,
  ): Promise<FileUploadResult> {
    let ft: FileTransfer
    console.log('uploading', serverURL, fileURL)
    const promise = new Promise((resolve, reject) => {
      ft = new FileTransfer()
      if (onProgress) {
        ft.onprogress = onProgress
      }
      ft.upload(fileURL, serverURL, resolve, reject, opts, trustAllHosts)
    }) as CancelPromise<FileUploadResult>
    promise.cancel = () => {
      if (ft) {
        ft.abort()
      }
    }
    return promise
  }

  static download (
    serverURL: string,
    fileURL: string,
    trustAllHosts = false,
    opts?: FileDownloadOptions,
    onProgress?: ProgressHandler,
  ) {
    console.log('FileTransfer.download', serverURL, fileURL, trustAllHosts, opts, onProgress)
    let ft: FileTransfer
    const promise = new Promise((resolve, reject) => {
      ft = new FileTransfer()
      if (onProgress) {
        ft.onprogress = onProgress
      }
      ft.download(serverURL, fileURL, resolve, reject, trustAllHosts, opts)
    }) as CancelPromise<FileEntry>

    promise.cancel = () => {
      if (ft) {
        ft.abort()
      }
    }
    return promise.then(entry => {
      return convert.fileEntry(entry)
    })
  }

  static uploadEntry (
    serverURL: string,
    entry: FileEntry | FSFileEntry,
    opts?: FileUploadOptions,
    onProgress?: ProgressHandler,
  ) {
    return this.upload(serverURL, entry.nativeURL, opts, onProgress)
  }

  static downloadEntry (
    serverURL: string,
    entry: FileEntry | FSFileEntry,
    trustAllHosts = false,
    opts?: FileDownloadOptions,
    onProgress?: ProgressHandler,
  ) {
    return this.download(serverURL, entry.nativeURL, trustAllHosts, opts, onProgress)
  }

  static downloadWithTemp (
    serverURL: string,
    fileURL: string,
    trustAllHosts = false,
    opts?: FileDownloadOptions,
    onProgress?: ProgressHandler,
  ) {
    const p = this.download(serverURL, fileURL + '.tmp', trustAllHosts, opts, onProgress)
    p.then(async entry => {
      return entry.fileSystem.mv(entry.toURL(), fileURL)
    })
    return p
  }
}
