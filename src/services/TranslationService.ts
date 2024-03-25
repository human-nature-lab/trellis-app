import Translation from '../entities/trellis/Translation'
import Locale from '../entities/trellis/Locale'

export default class TranslationService {
  /**
   * Get the translation with the provided locale
   * @param translation
   * @param locale
   * @returns {string|null}
   */
  static getTranslated (translation: Translation, locale: Locale): string {
    // translation = transformToTranslation(translation)
    if (locale) {
      if (translation.translationText) {
        const translationText = translation.translationText.find(tt => {
          return tt.localeId === locale.id
        })
        return translationText ? translationText.translatedText : null
      }
    } else {
      return null
    }
  }

  /**
   * Get any translation, but favor the provided locale if it exists
   * @param translation
   * @param locale
   * @returns {null|string}
   */
  static getAny (translation: Translation, locale: Locale = null) {
    let translated = TranslationService.getTranslated(translation, locale)
    if (!translated) {
      if (translation.translationText && translation.translationText.length) {
        const firstTrans = translation.translationText[0]
        translated = firstTrans.translatedText
        if (translated && firstTrans.locale && firstTrans.locale.languageTag) {
          translated += ` (${firstTrans.locale.languageTag})`
        }
      }
    }
    return translated || '[No translation text exists for this resource]'
  }
}
