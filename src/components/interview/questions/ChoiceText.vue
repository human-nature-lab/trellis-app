<template>
  <AsyncTranslationText
    passive
    :translation="translation"
    :location="location">
  </AsyncTranslationText>
</template>

<script>
  import AsyncTranslationText from '../../AsyncTranslationText.vue'
  import TranslationMixin from '../../../mixins/TranslationMixin'
  import Translation from '../../../entities/trellis/Translation'
  export default {
    name: 'choice-text',
    props: {
      translation: {
        type: Translation,
        required: true
      },
      location: {
        type: Object,
        required: true
      }
    },
    mixins: [TranslationMixin],
    components: {
      AsyncTranslationText
    }
  }
</script>

<style scoped>

</style>
