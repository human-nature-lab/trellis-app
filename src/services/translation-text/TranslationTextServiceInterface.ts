import TranslationText from "../../entities/trellis/TranslationText";

export default interface TranslationTextServiceInterface {

  /**
   * Create a new TranslationText object for the given translation
   * @param translationId
   * @param translationText
   */
  createTranslationText (translationId: string, translationText: TranslationText): PromiseLike<TranslationText>

  /**
   * Update the provided TranslationText in the database
   * @param {string} translationTextId
   * @param {string} translatedText
   */
  updateTranslatedTextById (translationTextId: string, translatedText: string): PromiseLike<TranslationText>


  /**
   * Get an array of translation text for the provided translation
   * @param {string} translationId
   * @returns {PromiseLike<TranslationText[]>}
   */
  getTranslatedTextByTranslationId (translationId: string): PromiseLike<TranslationText[]>
}
