<template>
  <v-flex xs12 sm6 md4 lg3 xl2>
    <v-card
      tile
      :class="{selected: selected === true, respondent: true}">
      <v-card-media class="respondent-photo"
                    @click="onClick()">
        <Photo :photo="respondent.photos[0]"></Photo>
      </v-card-media>
      <v-card-text class="respondent-name"
                   @click="onClick()">
        {{respondent.name}}
        <!--<v-btn @click="onClick">Select</v-btn>-->
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
      },
      selected: {
        type: Boolean
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
  .selected
    background-color: orangered
    color: white
  .respondent-photo
    img
      width: 100%
      height: 100%
      max-width: 100%
      max-height: 100%
</style>
