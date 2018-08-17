<template>
    <InterpolatedText
      :text="translated"
      :location="location" />
</template>

<script>
  import InterpolatedText from '../InterpolatedText'
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
      InterpolatedText
    }
  }
</script>

<style scoped>

</style>
