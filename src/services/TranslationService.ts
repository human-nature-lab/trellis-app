import Translation from "../entities/trellis/Translation";
import Locale from "../entities/trellis/Locale";

/**
 * Temp function used to determine the keys to use when accessing translation properties. Can handle plain object or
 * translation
 * @param {Translation} translation
 */
function transformToTranslation (translation: Translation): Translation {
  if (translation == null) return translation
  if (!(translation instanceof Translation)) {
    return new Translation().fromSnakeJSON(translation)
  }
  return translation
}

export default class TranslationService {

  /**
   * Get the translation with the provided locale
   * @param translation
   * @param locale
   * @returns {string|null}
   */
  static getTranslated (translation: Translation, locale: Locale): string {
    translation = transformToTranslation(translation)
    if (locale) {
      if (translation.translationText) {
        let translationText = translation.translationText.find(tt => {
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
    translation = transformToTranslation(translation)
    let translated = TranslationService.getTranslated(translation, locale)
    if (!translated) {
      let firstTrans = translation.translationText[0]
      translated = firstTrans.translatedText
      if (translated && firstTrans.locale && firstTrans.locale.languageTag) {
        translated += ` (${firstTrans.locale.languageTag})`
      }
    }
    return translated || '[No translation text exists for this resource]'
  }
}
