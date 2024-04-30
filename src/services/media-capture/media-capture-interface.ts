import { FSFileEntry } from '@/cordova/file'

export type FileUploadOptions = {
  types?: string[]
}

export interface MediaCaptureServiceInterface {
  captureImage (): Promise<(Blob | FSFileEntry)[]>

  captureVideo (): Promise<(Blob | FSFileEntry)[]>

  captureAudio (): Promise<(Blob | FSFileEntry)[]>

  uploadFile (opts?: FileUploadOptions): Promise<(Blob | FSFileEntry)[]>
}
