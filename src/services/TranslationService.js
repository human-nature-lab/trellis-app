class TranslationService {
  constructor (locale = null) {
    this.locale = locale
  }
  setLocale (locale) {
    this.locale = locale
  }
  getText (translation) {
    return translation.translation_text.find(tt => {
      return tt.locale_id === this.locale.id
    }).translated_text
  }
}

export default new TranslationService()
