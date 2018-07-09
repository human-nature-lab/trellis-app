export default class TranslationService {
  /**
   * Get the translation with the provided locale
   * @param translation
   * @param locale
   * @returns {string|null}
   */
  static getTranslated (translation, locale) {
    if (locale) {
      if (translation.translation_text) {
        let translationText = translation.translation_text.find(tt => {
          return tt.locale_id === locale.id
        })
        return translationText ? translationText.translated_text : null
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
  static getAny (translation, locale = null) {
    let translated
    if (locale) {
      translated = TranslationService.getTranslated(translation, locale)
    }
    if (!translated) {
      translated = translation.translation_text[0].translated_text
    }
    return translated || 'No translation text exists for this translation'
  }
}
