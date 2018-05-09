<template>
    <v-list-tile>
      <v-list-contents>
        {{this.translated}}
      </v-list-contents>
    </v-list-tile>
</template>

<script>
  import TranslationMixin from '@/mixins/TranslationMixin'
  export default {
    name: 'geo-list-tile',
    props: {
      geo: {
        type: Object,
        required: true
      }
    },
    data: function () {
      return {
        translation: this.geo.name_translation
      }
    },
    mixins: [TranslationMixin]
  }
</script>

<style scoped>

</style>
