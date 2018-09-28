import FileService from '../file/FileService'
import DatabaseService from '../database/DatabaseService'
import Photo from '../../entities/trellis/Photo'
import SizeLimitedMap from '../../classes/SizeLimitedMap'
const cache = new SizeLimitedMap(1024 * 10000)
import uuid from 'uuid/v4'
import PhotoServiceAbstract from './PhotoServiceAbstract'

declare global {
  interface Window {ImageResizer: any}
}

export default class PhotoServiceCordova extends PhotoServiceAbstract {

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

  resize (uri: string, quality: number): Promise<string> {
    return new Promise((resolve, reject) => {
      window.ImageResizer.resize({uri, quality}, resolve, err => {
        debugger
        reject('Failed to resize the image ' + JSON.stringify(err))
      })
    })
  }

  takePhoto (): Promise<Photo> {
    return new Promise((resolve, reject) => {
      if (!navigator || !navigator.camera) {
        return reject(new Error('Camera api not found'))
      }
      navigator.camera.getPicture((filePath) => {
        const photo = new Photo()
        photo.id = uuid()
        FileService.getFullResPhotosDir().then(fullResDir => {
          return FileService.move(filePath, fullResDir.nativeURL, `${photo.id}_hd.jpg`)
        }).then((fullResEntry: FileEntry) => {
          return FileService.getPhotosDir().then(photosDir => {
            // TODO: Compress and copy the file into the respondent-photos
            return this.resize(fullResEntry.nativeURL, 50).then(resizedFileName => {
              return FileService.move(resizedFileName, photosDir.nativeURL, `${photo.id}.jpg`)
            })
          })
        }).then(lowResEntry => {
          photo.fileName = lowResEntry.name
          return DatabaseService.getRepository(Photo)
        }).then(repo => repo.save(photo))
        .then(() => {
          resolve(photo)
        }).catch(err => {
          debugger
          reject(err)
        })
      }, reject, {
        quality: 100
      })
    })
  }
}
