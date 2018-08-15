export default interface PhotoServiceInterface {
  /**
   * Load the image source as as string
   * @param photoId
   * @returns {Promise<string>}
   */
  getPhotoSrc (photoId: string): Promise<string>

  /**
   * Cancel any outstanding photos that are loading
   */
  cancelAllOutstanding (): void
}
