import FileService from '../file/FileService'
import DatabaseService from '../database/DatabaseService'
import Photo from '../../entities/trellis/Photo'
import uuid from 'uuid/v4'
import PhotoServiceAbstract, {CancelFunction} from './PhotoServiceAbstract'
import {In, IsNull} from 'typeorm'
import CancellablePromise from "../../classes/CancellablePromise";

declare global {
  interface Window {ImageResizer: any}
}

export default class PhotoServiceCordova extends PhotoServiceAbstract {

  async getPhotosByIds (photoIds: string[]): Promise<Photo[]> {
    if (!photoIds.length) return []
    const repo = await DatabaseService.getRepository(Photo)
    return repo.find({
      where: {
        id: In(photoIds)
      }
    })
  }

  getPhotoSrc (photoId: string): [Promise<string>, CancelFunction] {
    const p: Promise<string> = new Promise(async (resolve, reject) => {
      try {
        const connection = await DatabaseService.getDatabase()
        const repository = await connection.getRepository(Photo)
        const photo = await repository.findOne(photoId)
        if (!photo) {
          throw new Error('Invalid photo ID')
        }
        const fileEntry = await FileService.getPhoto(photo.fileName)
        resolve(FileService.readFileAsDataURL(fileEntry))
      } catch (err) {
        reject(err)
      }
    })
    return [p, () => {}]
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
        FileService.getPhotosDir().then(fullResDir => {
          return FileService.move(filePath, fullResDir.nativeURL, `${photo.id}.jpg`)
        })/*.then((fullResEntry: FileEntry) => {
          return FileService.getPhotosDir().then(photosDir => {
            // TODO: Compress and copy the file into the respondent-photos
            return this.resize(fullResEntry.nativeURL, 50).then(resizedFileName => {
              return FileService.move(resizedFileName, photosDir.nativeURL, `${photo.id}.jpg`)
            })
          })
        })*/.then(photoEntry => {
          photo.fileName = photoEntry.name
          return DatabaseService.getRepository(Photo)
        }).then(repo => repo.save(photo))
        .then(() => {
          resolve(photo)
        }).catch(err => {
          reject(err)
        })
      }, reject, {
        quality: 100
      })
    })
  }

  async getPhotoCount (): Promise<number> {
    const repo = await DatabaseService.getRepository(Photo)
    return repo.count({
      deletedAt: IsNull()
    })
  }

  async getPhotoFileCount (): Promise<number> {
    return FileService.countDirectoryFiles(await FileService.getPhotosDir())
  }

  getPhotosSize (): CancellablePromise<number> {
    return FileService.getPhotosDir().then(dir => {
      return FileService.getDirectorySize(dir, true)
    })
  }
}
