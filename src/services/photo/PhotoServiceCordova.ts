import FileService from '../file/FileService'
import DatabaseService from '../database/DatabaseService'
import Photo from '../../entities/trellis/Photo'
import SizeLimitedMap from '../../classes/SizeLimitedMap'
const cache = new SizeLimitedMap(1024 * 10000)
import PhotoServiceInterface from './PhotoServiceInterface'
export default class PhotoServiceCordova implements PhotoServiceInterface {

   async getPhotoSrc (photoId: string): Promise<any> {
     if (cache.has(photoId)) {
       return cache.get(photoId)
     }

     const connection = await DatabaseService.getDatabase()
     const repository = await connection.getRepository(Photo)
     const photo = await repository.findOne(photoId)
     if (!photo) {
       throw new Error('Invalid photo ID')
     }

     const fileEntry = await FileService.getPhoto(photo.fileName)

     return new Promise((resolve, reject) => {
       fileEntry.file((blob) => {
         const reader = new FileReader()
         reader.onloadend = function () {
           let src = reader.result
           cache.set(photoId, src)
           resolve(src)
         }

         reader.onerror = function(err) {
           reject(err)
         }

         reader.readAsDataURL(blob)
       })
     })
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

  /**
   * This method returns an array of photo filenames and IDs of all undeleted photos from the Photo table
   * This method is much more efficient than the 'getPhotos' method above which returns an array of Photo entities.
   * @returns {Promise<Array>}
   */
  async getPhotoIdsAndFileNames () {
    const connection = await DatabaseService.getDatabase()
    return connection.query(
      `select id, file_name
        from photo 
        where deleted_at is null;`)
  }
}
