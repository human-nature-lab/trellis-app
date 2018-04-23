<template>
  <v-flex xs4>
    <v-card
      tile
      class="respondent"
      @click="onClick">
      <v-card-media class="respondent-photo">
        <Photo :photo="respondent.photos[0]"></Photo>
      </v-card-media>
      <v-card-text class="respondent-name">
        {{respondent.name}}
        <v-btn @click="onClick">Select</v-btn>
      </v-card-text>
    </v-card>
  </v-flex>
</template>

<script>
  import Photo from './Photo'
  export default {
    name: 'respondent',
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
  .respondent-photo
    img
      width: 100%
      height: 100%
      max-width: 100%
      max-height: 100%
</style>
