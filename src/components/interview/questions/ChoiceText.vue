<template>
    <InterpolatedText :text="translated" />
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
