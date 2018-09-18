export default interface TranslationTextServiceInterface {

  /**
   * Update the provided TranslationText in the database
   * @param {string} translationTextId
   * @param {string} translatedText
   */
  updateTranslatedTextById (translationTextId: string, translatedText: string): Promise<any>

}
