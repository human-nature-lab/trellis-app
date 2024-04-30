import { MediaCaptureServiceInterface, FileUploadOptions } from './media-capture-interface'

export class MediaCaptureService implements MediaCaptureServiceInterface {
  async captureImage (): Promise<Blob[]> {
    throw new Error('Not implemented')
  }

  async captureVideo (): Promise<Blob[]> {
    throw new Error('Not implemented')
  }

  async captureAudio (): Promise<Blob[]> {
    throw new Error('Not implemented')
  }

  async uploadFile (opts?: FileUploadOptions): Promise<Blob[]> {
    throw new Error('Not implemented')
  }
}
