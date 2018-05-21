<template>
    <InterpolatedText
      :text="translated"
      :location="location" />
</template>

<script>
  import InterpolatedText from '../InterpolatedText'
  import TranslationMixin from '../../../mixins/TranslationMixin'
  export default {
    name: 'choice-text',
    props: {
      translation: {
        type: Object,
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
