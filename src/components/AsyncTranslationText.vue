<template>
  <component
    :is="tag"
    class="async-translation-text"
    v-bind="$attrs"
    v-on="$listeners"
  >
    {{ translated }}
  </component>
</template>

<script>
  import TranslationTextService from '../services/translation-text'
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
      },
      passive: {
        type: Boolean,
        default: false
      },
      tag: {
        type: String,
        default: 'span',
      }
    },
    data () {
      return {
        translated: this.$t('loading'),
        localTranslation: this.translation.copy(),
      }
    },
    watch: {
      translation (newT, oldT) {
        // Only update if the translation id changes. Passive prop should be used if the
        // translation reference gets updated frequently but nothing changes to prevent screen flashing
        if (this.passive && newT && oldT && newT.id === oldT.id) {
          return
        }
        this.reset()
      },
      location (newL, oldL) {
        if (!(newL.page === oldL.page && newL.section === oldL.section && newL.sectionRepetition === oldL.sectionRepetition && newL.sectionFollowUpRepetition === oldL.sectionFollowUpRepetition)) {
          this.reset()
        }
      }
    },
    created () {
      this.loadTranslation()
    },
    methods: {
      reset () {
        this.localTranslation = this.translation.copy()
        this.loadTranslation()
      },
      async loadTranslation () {
        try {
          // Don't load if they already exist
          if (!this.localTranslation || !this.localTranslation.translationText || !this.localTranslation.translationText.length) {
            this.translated = this.$t('loading')
            this.localTranslation.translationText = await TranslationTextService.getTranslatedTextByTranslationId(this.localTranslation.id)
          }
          // If you are in an interview, interpolate any fills
          if (this.location) {
            this.localTranslation.translationText = await InterpolationService.getInterpolatedTranslationText(this.localTranslation.translationText, this.location)
          }
          this.getTranslated()
        } catch (err) {
          if (this.isNotAuthError(err)) {
            this.logError(err)
          }
        }
      },
      getTranslated () {
        this.translated = TranslationService.getAny(this.localTranslation, global.locale)
      }
    }
  }
</script>
