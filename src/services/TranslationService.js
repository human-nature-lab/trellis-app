import storage from '@/services/storage/StorageService'
export default class TranslationService {
  static getTranslated (translation) {
    let locale = storage.get('localeId', 'string')
    if (locale) {
      if (translation.translation_text) {
        let translationText = translation.translation_text.find(tt => {
          return tt.locale_id === locale
        })
        return translationText ? translationText.translated_text : `NO TRANSLATION PRESENT FOR LOCALE: ${locale}`
      }
    } else {
      return null
    }
  }
}
