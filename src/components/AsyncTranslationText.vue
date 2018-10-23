<template>
    <span class="async-translation-text">
        {{ translated }}
    </span>
</template>

<script>
  import TranslationTextService from '../services/translation-text/TranslationTextService'
  import TranslationService from '../services/TranslationService'
  import InterpolationService from '../services/InterpolationService'
  import global from '../static/singleton'

  export default {
    name: 'async-translation-text',
    props: {
      translation: {
        type: Object,
        required: true
      },
      modifier: {
        type: Function
      },
      location: {
        type: Object
      }
    },
    data () {
      return {
        translated: this.$t('loading'),
        localTranslation: this.translation
      }
    },
    watch: {
      translation (newTranslation) {
        if (newTranslation.id !== this.localTranslation.id) {
          this.localTranslation = newTranslation
          this.loadTranslation()
        }
      }
    },
    created () {
      this.loadTranslation()
    },
    methods: {
      async loadTranslation () {
        // Don't load if they already exist
        if (this.localTranslation && this.localTranslation.translationText && this.localTranslation.translationText.length) {
          return this.getTranslated()
        }
        this.translated = this.$t('loading')
        this.localTranslation.translationText = await TranslationTextService.getTranslatedTextByTranslationId(this.localTranslation.id)
        // If you are in an interview, interpolate any fills
        if (this.location) {
          this.localTranslation.translationText = await InterpolationService.getInterpolatedTranslationText(this.localTranslation.translationText, this.location)
        }
        this.getTranslated()
      },
      getTranslated () {
        this.translated = TranslationService.getAny(this.localTranslation, global.locale)
      }
    }
  }
</script>

<style scoped>

</style>
