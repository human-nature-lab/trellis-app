import FileService from '@/services/file/FileService'
import { getRepository } from 'typeorm'
import DatabaseService from '@/services/database/DatabaseService'
import Photo from '@/entities/trellis/Photo'
import SizeLimitedMap from '@/classes/SizeLimitedMap'
const cache = new SizeLimitedMap(1000)
import CancellablePromise from '@/classes/CancellablePromise'
export default class PhotoServiceCordova {
  /**
   * This is a special method that can be cancelled. We probably don't need to cancel image loading on tablets, but maybe
   * we could.
   * @param photoId
   * @returns {Promise<string>}
   */
  static getPhotoSrc (photoId) {
    // Get the base64 encoded photo and return the url. This method is cached
    const p = new CancellablePromise(resolve => {
      if (cache.has(photoId)) {
        return resolve(cache.get(photoId))
      } else {
        const photoRepository = getRepository(Photo)
        photoRepository.findOne(photoId)
          .then((photo) => {
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

  /**
   * This method returns all undeleted photos from the Photo table
   * @returns {Promise<Array>}
   */
  static async getPhotos () {
    const connection = await DatabaseService.getDatabase()
    const repository = await connection.getRepository(Photo)
    return repository.find({ deletedAt: null })
  }
}
