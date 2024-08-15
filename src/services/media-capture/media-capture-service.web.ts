import { requestWebRecording } from '@/components/audio-recorder/web-recorder'
import { MediaCaptureServiceInterface, FileUploadOptions } from './media-capture-interface'
import { requestUpload } from '@/components/asset/asset-upload'

export class MediaCaptureService implements MediaCaptureServiceInterface {
  async captureImage (): Promise<File[]> {
    throw new Error('Not implemented')
  }

  async captureVideo (): Promise<File[]> {
    throw new Error('Not implemented')
  }

  async captureAudio (): Promise<File[]> {
    const blob = await requestWebRecording()
    return [blob]
  }

  async captureExternalAudio(): Promise<File[]> {
    throw new Error('This method is not available')
  }

  async uploadFile (opts?: FileUploadOptions): Promise<File[]> {
    return requestUpload(opts)
  }
}
