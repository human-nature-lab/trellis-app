export default class TranslationService {
  static getTranslated (translation, locale) {
    if (locale) {
      if (translation.translation_text) {
        let translationText = translation.translation_text.find(tt => {
          return tt.locale_id === locale.id
        })
        return translationText ? translationText.translated_text : `NO TRANSLATION PRESENT FOR LOCALE: ${locale.language_name}, (${locale.id})`
      }
    } else {
      return null
    }
  }
}
