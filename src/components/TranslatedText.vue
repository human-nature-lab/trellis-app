<template>
    <span class="translated">{{text}}</span>
</template>

<script>
  import TranslationService from '@/services/TranslationService'
  export default {
    name: 'translated-text',
    props: {
      translation: {
        type: Object,
        required: true
      },
      locale: {
        type: Object,
        required: true
      }
    },
    data: function () {
      return {
        text: TranslationService.getTranslated(this.translation, this.locale)
      }
    }
  }
</script>

<style scoped>

</style>
