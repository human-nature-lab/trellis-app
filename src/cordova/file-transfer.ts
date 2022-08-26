import { CancelPromise } from '@/types/CancelPromise'

type ProgressHandler = (evt: { loaded: number, total: number, lengthComputable: boolean }) => void

export class filetransfer {
  static upload (serverURL: string, fileURL: string, opts?: FileUploadOptions, onProgress?: ProgressHandler) {
    let ft: FileTransfer
    const promise = new Promise((resolve, reject) => {
      ft = new FileTransfer()
      if (onProgress) {
        ft.onprogress = onProgress
      }
      ft.upload(fileURL, serverURL, resolve, reject, opts)
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
    return promise
  }
}
