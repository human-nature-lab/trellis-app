import http from '../http/AxiosInstance'
import InstrumentedCache from '@/classes/InstrumentedCache'
const cache = new InstrumentedCache(1000)
export default class PhotoServiceWeb {
  static getPhotoSrc (photoId) {
    // Get the base64 encoded photo and return the url. This method is cached
    return new Promise(resolve => {
      if (cache.has(photoId)) {
        return resolve(cache.get(photoId))
      } else {
        return http().get(`photo/${photoId}`).then(res => {
          let src = `data:${res.headers['content-type']};base64,` + res.data
          cache.set(photoId, src)
          return src
        }).catch(err => {
          if (err.response.status === 404) {
            return 'undefined'
          } else {
            console.error(err)
          }
        })
      }
    })
  }
}
