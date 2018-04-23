<template>
  <v-flex>
    <v-container fluid row grid-list-sm>
      <v-layout row wrap class="respondents">
        <Respondent
          :key="respondent.id"
          v-for="respondent in respondents"
          @selected="onSelect(respondent)"
          :respondent="respondent"/>
      </v-layout>
    </v-container>
  </v-flex>
</template>

<script>
  import Respondent from './Respondent'
  export default {
    name: 'respondents-view',
    props: {
      respondents: {
        type: Array,
        required: true
      },
      selected: {
        type: Array,
        required: false
      }
    },
    methods: {
      showMore: function (respondent) {
        console.log('TODO: Show more information on the respondent. Locations, names, respondent condition tags, etc.')
      },
      onSelect: function (respondent) {
        this.$emit('selected', respondent)
      },
      isSelected: function (respondent) {
        return this.selected.indexOf(respondent.id) > -1
      }
    },
    components: {
      Respondent
    }
  }
</script>

<style lang="sass" scoped>
.selected
  background: orangered
</style>
