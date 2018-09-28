import Photo from "../../entities/trellis/Photo";

export default abstract class PhotoServiceAbstract {
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

  abstract takePhoto (): Promise<Photo>
}
