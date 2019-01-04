import http from '../http/AxiosInstance'
import axios from 'axios'
import SizeLimitedMap from '../../classes/SizeLimitedMap'
const cache = new SizeLimitedMap(1024 * 10000)
import CancellablePromise from '../../classes/CancellablePromise'
import PhotoServiceAbstract from './PhotoServiceAbstract'
import Photo from "../../entities/trellis/Photo";

export default class PhotoServiceWeb extends PhotoServiceAbstract {

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
    console.log(`cancelled ${count} outstanding photo requests`)
  }

  getPhotoSrc (photoId) {
    let source
    // Get the base64 encoded photo and return the url. This method is cached
    const p = new CancellablePromise(async (resolve, reject) => {
      if (cache.has(photoId)) {
        resolve(cache.get(photoId))
      } else {
        try {
          source = axios.CancelToken.source()
          const res = await http().get(`photo/${photoId}`, {
            cancelToken: source.token
          })
          let src = `data:${res.headers['content-type']};base64,` + res.data
          cache.set(photoId, src)
          resolve(src)
        } catch (err) {
          reject(err)
        } finally {
          this.existingCancelTokens.delete(source)
        }
      }
    }, () => {
      if (source && source.cancel) {
        source.cancel('Canceled image load')
      }
    })
    return p
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
