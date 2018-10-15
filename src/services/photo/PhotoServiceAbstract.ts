import Photo from "../../entities/trellis/Photo";

export default abstract class PhotoServiceAbstract {

  /**
   * Return an array of photos from an array of photo ids
   * @param {string[]} photoIds
   * @returns {Promise<Photo[]>}
   */
  abstract getPhotosByIds (photoIds: string[]): Promise<Photo[]>

  /**
   * Load the image source as as string
   * @param photoId
   * @returns {Promise<string>}
   */
  abstract getPhotoSrc (photoId: string): Promise<any>

  /**
   * Cancel any outstanding photos that are loading
   */
  abstract cancelAllOutstanding (): void

  /**
   * Take a photo
   * @returns {Promise<Photo>}
   */
  abstract takePhoto (): Promise<Photo>
}
