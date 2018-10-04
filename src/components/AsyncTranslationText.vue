<template>
    <span class="async-translation-text">
      <span v-if="isLoading">{{$t('loading')}}</span>
      <span v-else>{{translated}}</span>
    </span>
</template>

<script>
  export default {
    name: 'AsyncTranslationText',
    props: {
      translation: {
        type: Object,
        required: true
      },
      modifier: {
        type: Function
      }
    },
    data () {
      return {
        isLoading: false
      }
    },
    created () {
      this.loadTranslation()
    },
    methods: {
      async loadTranslation () {
        if (this.isLoading || this.hasTranslationText) return
        this.isLoading = true
        let translationText = await TranslationTextService.getTranslatedTextByTranslationId(this.translation.id)
        this.$set(this.translation, 'translationText', translationText)
      }
    },
    watch: {
      translation (newVal) {
        if (newVal !== this.translation) {
          this.loadTranslation()
        }
      }
    },
    computed: {
      hasTranslationText () {
        return this.translation.translationText && this.translation.translationText.length
      },
      translated () {
        let translated = TranslationService.getAny(this.translation)
        if (this.modifier) {
          translated = this.modifier(translated)
        }
        return translated
      }
    }
  }
</script>

<style scoped>

</style>
