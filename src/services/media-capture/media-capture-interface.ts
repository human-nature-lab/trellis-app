import { FSFileEntry } from '@/cordova/file'

export type FileUploadOptions = {
  extensions?: string[]
  max?: number
}

export interface MediaCaptureServiceInterface {
  captureImage (): Promise<(File | FSFileEntry)[]>

  captureVideo (): Promise<(File | FSFileEntry)[]>

  captureAudio (): Promise<(File | FSFileEntry)[]>

  captureExternalAudio (): Promise<(File | FSFileEntry)[]>

  uploadFile (opts?: FileUploadOptions): Promise<(FSFileEntry | File)[]>
}
