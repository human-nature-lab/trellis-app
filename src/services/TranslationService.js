import storage from './StorageService'
export default class TranslationService {
  static getTranslated (translation) {
    let locale = storage.get('locale', 'object')
    return translation.translation_text.find(tt => {
      return tt.locale_id === locale.id
    }).translated_text
  }
}
