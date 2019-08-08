import TranslationService from '../services/TranslationService'
import Translation from '../entities/trellis/Translation'
import Locale from '../entities/trellis/Locale'

export default {
  methods: {
    translate (translation: Translation, locale?: Locale) {
      return TranslationService.getAny(translation, locale)
    }
  }
}
