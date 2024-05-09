import md5 from 'js-md5'
import { FSFileEntry } from '@/cordova/file'

export default class HashService {
  static async md5Entry (entry: FSFileEntry) {
    const buffer = await entry.getArrayBuffer()
    return md5(buffer)
  }

  static async md5Blob (blob: Blob) {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        if (reader.result instanceof ArrayBuffer) {
          const buffer = new Uint8Array(reader.result)
          resolve(md5(buffer))
        } else {
          reject(new Error('Failed to read blob as array buffer'))
        }
      }
      reader.onerror = (e) => {
        reject(e)
      }
      reader.readAsArrayBuffer(blob)
    })
  }
}
