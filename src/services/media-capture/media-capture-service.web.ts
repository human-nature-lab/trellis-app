import { requestWebRecording } from '@/components/audio-recorder/web-recorder'
import { MediaCaptureServiceInterface, FileUploadOptions } from './media-capture-interface'

export class MediaCaptureService implements MediaCaptureServiceInterface {
  async captureImage (): Promise<Blob[]> {
    throw new Error('Not implemented')
  }

  async captureVideo (): Promise<Blob[]> {
    throw new Error('Not implemented')
  }

  async captureAudio (): Promise<Blob[]> {
    const blob = await requestWebRecording()
    return [blob]
  }

  async uploadFile (opts?: FileUploadOptions): Promise<Blob[]> {
    throw new Error('Not implemented')
  }
}
