import FileService from '../file/FileService'
import { getRepository } from 'typeorm'
import DatabaseService from '../database/DatabaseService'
import Photo from '../../entities/trellis/Photo'
import SizeLimitedMap from '../../classes/SizeLimitedMap'
const cache = new SizeLimitedMap(1000)
import CancellablePromise from '../../classes/CancellablePromise'
import PhotoServiceInterface from "./PhotoServiceInterface";
export default class PhotoServiceCordova implements PhotoServiceInterface {
   getPhotoSrc (photoId) {
    // Get the base64 encoded photo and return the url. This method is cached
    const p = new CancellablePromise(resolve => {
      if (cache.has(photoId)) {
        return resolve(cache.get(photoId))
      } else {
        const photoRepository = getRepository(Photo)
        photoRepository.findOne(photoId)
          .then((photo: Photo) => {
            console.log('photo', photo)
            FileService.getPhoto(photo.fileName)
              .then((fileEntry) => {
                fileEntry.file((blob) => {
                  const reader = new FileReader()
                  reader.readAsDataURL(blob)
                  reader.onloadend = function () {
                    let src = reader.result
                    cache.set(photoId, src)
                    return src
                  }
                })
              })
          })
          .catch(err => {
            throw err
          })
      }
    })
    return p
  }

  cancelAllOutstanding () {}

  /**
   * This method returns all undeleted photos from the Photo table
   * @returns {Promise<Array>}
   */
  async getPhotos () {
    const connection = await DatabaseService.getDatabase()
    const repository = await connection.getRepository(Photo)
    return repository.find({ deletedAt: null })
  }
}
