<template>
    <v-list-tile @click="$emit('click')">
      <!--<v-list-tile-avatar>-->
        <!--<Photo :photo="primaryPhoto" height="50" width="50" />-->
      <!--</v-list-tile-avatar>-->
      <v-list-tile-content>
        {{this.translated}}
      </v-list-tile-content>
      <v-list-tile-action>
        <v-btn @click="$emit('geo-select')">Select</v-btn>
      </v-list-tile-action>
    </v-list-tile>
</template>

<script>
  import TranslationMixin from '@/mixins/TranslationMixin'
  import Photo from '@/components/Photo'
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
    computed: {
      primaryPhoto: function () {
        return this.geo.photos.length ? this.geo.photos[0] : {}
      }
    },
    mixins: [TranslationMixin],
    components: {
      Photo
    }
  }
</script>

<style scoped>

</style>
