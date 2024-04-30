import mediaCapture from '@/cordova/media-capture'
import { MediaCaptureServiceInterface, FileUploadOptions } from './media-capture-interface'
import { requestWebRecording } from '@/components/audio-recorder/recorder'
import { file, FSFileEntry } from '@/cordova/file'
import uuidv4 from 'uuid/v4'

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
    const data = await requestWebRecording()
    const dir = await file.temporary()
    const id = uuidv4()
    const name = `${id}.webm`
    const fileEntry = await dir.root.writeFile(name, data)
    return [fileEntry]
  }

  async uploadFile (opts?: FileUploadOptions): Promise<FSFileEntry[]> {
    throw new Error('Not implemented')
  }
}
