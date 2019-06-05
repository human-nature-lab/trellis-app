import Photo from '../../entities/trellis/Photo'

export type CancelFunction = (msg: string) => void

export default abstract class PhotoServiceAbstract {

  /**
   * Return an array of photos from an array of photo ids
   * @param {string[]} photoIds
   * @returns {PromiseLike<Photo[]>}
   */
  abstract getPhotosByIds (photoIds: string[]): PromiseLike<Photo[]>

  /**
   * Load the image source as as string
   * @param photoId
   * @returns {PromiseLike<string>}
   */
  abstract getPhotoSrc (photoId: string): [PromiseLike<string>, CancelFunction]

  /**
   * Cancel any outstanding photos that are loading
   */
  abstract cancelAllOutstanding (): void

  /**
   * Take a photo
   * @returns {PromiseLike<Photo>}
   */
  abstract takePhoto (): PromiseLike<Photo>

  /**
   * Return the count of photos in the database.
   * @returns {PromiseLike<number>}
   */
  abstract getPhotoCount (): PromiseLike<number>

  /**
   * Get the count of photos on the file system
   * @returns {PromiseLike<number>}
   */
  abstract getPhotoFileCount (): PromiseLike<number>
}
