import storage from '@/services/storage/StorageService'
export default class TranslationService {
  static getTranslated (translation) {
    let locale = storage.get('localeId', 'string')
    if (locale) {
      return translation.translation_text.find(tt => {
        return tt.locale_id === locale
      }).translated_text
    } else {
      return null
    }
  }
}
