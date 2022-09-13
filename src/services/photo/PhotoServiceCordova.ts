import FileService from '../file'
import DatabaseService from '../database'
import Photo from '../../entities/trellis/Photo'
import uuid from 'uuid/v4'
import PhotoServiceAbstract, { CancelFunction } from './PhotoServiceAbstract'
import { In, IsNull } from 'typeorm'
import CancellablePromise from '../../classes/CancellablePromise'
import { camera } from '@/cordova/camera'

declare global {
  interface Window {ImageResizer: any}
}

export class PhotoServiceCordova extends PhotoServiceAbstract {
  async getPhotosByIds (photoIds: string[]): Promise<Photo[]> {
    if (!photoIds.length) return []
    const repo = await DatabaseService.getRepository(Photo)
    return repo.find({
      where: {
        id: In(photoIds),
      },
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
    const repo = await DatabaseService.getRepository(Photo)
    return repo.find({
      select: ['id', 'fileName'],
      where: {
        deletedAt: IsNull(),
      },
    })
  }

  resize (uri: string, quality: number): Promise<string> {
    return new Promise((resolve, reject) => {
      window.ImageResizer.resize({ uri, quality }, resolve, err => {
        reject('Failed to resize the image ' + JSON.stringify(err))
      })
    })
  }

  async takePhoto (): Promise<Photo> {
    const filePath = await camera.getPicture({
      quality: 100,
    })
    const photo = new Photo()
    photo.id = uuid()
    const fullResDir = await FileService.getPhotosDir()
    const photoEntry = await FileService.move(filePath, fullResDir.nativeURL, `${photo.id}.jpg`)
    photo.fileName = photoEntry.name
    const repo = await DatabaseService.getRepository(Photo)
    return repo.save(photo)
  }

  async getPhotoCount (): Promise<number> {
    const repo = await DatabaseService.getRepository(Photo)
    return repo.count({
      deletedAt: IsNull(),
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
