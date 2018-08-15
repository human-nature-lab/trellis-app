import http from '../http/AxiosInstance'
import axios from 'axios'
import SizeLimitedMap from '../../classes/SizeLimitedMap'
const cache = new SizeLimitedMap(1024 * 10000)
import CancellablePromise from '../../classes/CancellablePromise'
import PhotoServiceInterface from "./PhotoServiceInterface";

export default class PhotoServiceWeb implements PhotoServiceInterface {

  private existingCancelTokens = new Set()

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
    const p = new CancellablePromise(resolve => {
      if (cache.has(photoId)) {
        return resolve(cache.get(photoId))
      } else {
        source = axios.CancelToken.source()
        return resolve(http().get(`photo/${photoId}`, {
          cancelToken: source.token
        }).then(res => {
          let src = `data:${res.headers['content-type']};base64,` + res.data
          cache.set(photoId, src)
          return src
        }).catch(err => {
          throw err
        }).finally(() => {
          this.existingCancelTokens.delete(source)
        }))
        this.existingCancelTokens.add(source)
      }
    }, () => {
      if (source && source.cancel) {
        source.cancel('Canceled image load')
      }
    })
    return p
  }
}
