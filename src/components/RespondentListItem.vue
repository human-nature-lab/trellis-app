<template>
  <v-layout row class="respondent-list-item">
    <v-flex class="respondent-photo">
      <Photo :photo="respondent.photos[0]"></Photo>
    </v-flex>
    <v-flex class="respondent-name">
      {{respondent.name}}
      <v-btn @click="onClick">Select</v-btn>
    </v-flex>
  </v-layout>
</template>

<script>
  import Photo from './Photo'
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
  .respondent-list-item
    height: 150px
</style>
