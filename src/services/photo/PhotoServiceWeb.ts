import { roughSizeOf } from '../../classes/M'
import http, {Token} from '../http/AxiosInstance'
import axios from 'axios'
import LRU from 'lru-cache'
const cache = new LRU({
  max: 1024 * 10000,
  length: function (n, key) {
    return roughSizeOf(n) + roughSizeOf(key)
  }
})
import PhotoServiceAbstract, {CancelFunction} from './PhotoServiceAbstract'
import Photo from '../../entities/trellis/Photo'

export default class PhotoServiceWeb extends PhotoServiceAbstract {
l
  private existingCancelTokens = new Set()

  async getPhotosByIds (photoIds: string[]): Promise<Photo[]> {
    if (!photoIds.length) return []
    const idStr = photoIds.map(id => encodeURIComponent(id)).join(',')
    const res = await http().get(`photos/${idStr}`)
    return res.data.photos.map(p => {
      return new Photo().fromSnakeJSON(p)
    })
  }

  cancelAllOutstanding () {
    let count = 0
    for (let source of this.existingCancelTokens) {
      source.cancel('All outstanding requests cancelled')
      count++
    }
    this.existingCancelTokens.clear()
  }

  getPhotoSrc (photoId: string): [Promise<string>, CancelFunction] {
    if (cache.has(photoId)) {
      return [
        new Promise(resolve => resolve(cache.get(photoId) as string)),
        () => {}
      ]
    } else {
      const source = axios.CancelToken.source()
      const p: Promise<string> = new Promise(async (resolve, reject) => {
        try {
          this.existingCancelTokens.add(source)
          const res = await http().get(`photo/${photoId}`, {
            cancelToken: source.token
          })
          this.existingCancelTokens.delete(source)
          let src = `data:${res.headers['content-type']};base64,` + res.data
          cache.set(photoId, src)
          resolve(src)
        } catch (err) {
          reject(err)
        }
      })
      return [p, () => {source.cancel('Cancelled image load')}]
    }
  }

  async takePhoto (): Promise<Photo> {
    console.error('Need to implement this in WEB')
    return new Photo()
  }

  async getPhotoCount (): Promise<number> {
    throw Error('getPhotoCount is unimplemented')
  }

  async getPhotoFileCount (): Promise<number> {
    throw Error('getPhotoFileCount is unimplemented')
  }
}
