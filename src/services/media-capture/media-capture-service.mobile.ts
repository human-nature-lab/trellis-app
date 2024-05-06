import mediaCapture from '@/cordova/media-capture'
import { MediaCaptureServiceInterface, FileUploadOptions } from './media-capture-interface'
import { requestWebRecording } from '@/components/audio-recorder/web-recorder'
import { file, FSFileEntry } from '@/cordova/file'
import uuidv4 from 'uuid/v4'
import { requestMediaRecording } from '@/components/audio-recorder/media-recorder'

export class MediaCaptureService implements MediaCaptureServiceInterface {
  private async mediaToEntries (media: MediaFile[]): Promise<FSFileEntry[]> {
    const entries = await Promise.all(media.map(m => file.resolveLocalFileSystemURL(m.fullPath)))
    const files: FSFileEntry[] = []
    for (const entry of entries) {
      if (entry.isFile) {
        files.push(entry)
      }
    }
    return files
  }

  async captureImage (): Promise<FSFileEntry[]> {
    const media = await mediaCapture.captureImage({ limit: 1 })
    return this.mediaToEntries(media)
  }

  async captureVideo (): Promise<FSFileEntry[]> {
    const media = await mediaCapture.captureVideo({ limit: 1 })
    return this.mediaToEntries(media)
  }

  async captureAudio (): Promise<FSFileEntry[]> {
    const media = await requestMediaRecording()
    return [media]
  }

  async uploadFile (opts?: FileUploadOptions): Promise<FSFileEntry[]> {
    throw new Error('Not implemented')
  }
}
