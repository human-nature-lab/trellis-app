<template>
  <v-layout row class="respondent-list-item">
    <v-flex class="respondent-photo">
      <Photo :photo="respondent.photos[0]" allow-fullscreen></Photo>
    </v-flex>
    <v-spacer></v-spacer>
    <v-flex class="respondent-name" justify-end align-content-end>
      {{respondent.name}}
    </v-flex>
  </v-layout>
</template>

<script>
  import Photo from '../photo/Photo.vue'
  export default {
    name: 'respondent-list-item',
    props: {
      respondent: {
        type: Object,
        required: true
      }
    },
    methods: {
      onClick: function () {
        this.$emit('selected')
      }
    },
    components: {
      Photo
    }
  }
</script>

<style lang="sass" scoped>
  $height: 100px
  .respondent-list-item
    height: $height
  .respondent-photo
    height: $height
</style>
