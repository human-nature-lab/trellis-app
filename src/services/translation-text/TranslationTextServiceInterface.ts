import TranslationText from "../../entities/trellis/TranslationText";

export default interface TranslationTextServiceInterface {

  /**
   * Update the provided TranslationText in the database
   * @param {string} translationTextId
   * @param {string} translatedText
   */
  updateTranslatedTextById (translationTextId: string, translatedText: string): Promise<any>


  /**
   * Get an array of translation text for the provided translation
   * @param {string} translationId
   * @returns {Promise<TranslationText[]>}
   */
  getTranslatedTextByTranslationId (translationId: string): Promise<TranslationText[]>
}
