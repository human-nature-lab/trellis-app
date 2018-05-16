import TranslationService from '@/services/TranslationService'
export default {
  computed: {
    translated: function () {
      if (!this.global.locale) return 'Using this mixin requires registering the global locale variable!'
      if (!this.translation) return 'Using this mixin requires that translation be defined!'
      return TranslationService.getTranslated(this.translation, this.global.locale)
    }
  }
}
