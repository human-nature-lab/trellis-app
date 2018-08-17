import TranslationService from '../services/TranslationService'
import singleton from '../static/singleton'
export default {
  data () {
    return {
      global: singleton
    }
  },
  computed: {
    translated () {
      if (!this.global.locale) return 'Using this mixin requires registering the global locale variable!'
      if (!this.translation) return 'Using this mixin requires that translation be defined!'
      return TranslationService.getAny(this.translation, this.global.locale)
    }
  }
}
