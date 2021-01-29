<template>
  <TextQuestion
    v-on="$listeners"
    v-bind="Object.assign({}, $props, $attrs)"
    :textarea="true" />
</template>

<script lang="ts">
  import Vue from 'vue'
  import TextQuestion from './TextQuestion.vue'
  export default Vue.extend({
    name: 'TextAreaQuestion',
    components: { TextQuestion },
    props: {
      question: {
        type: Object,
        required: true
      }
    }
  })
</script>

<style lang="sass">
  
</style>