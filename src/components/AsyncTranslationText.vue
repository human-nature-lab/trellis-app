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
    name: 'AsyncTranslationText',
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
    created () {
      this.loadTranslation()
    },
    methods: {
      async loadTranslation () {
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
