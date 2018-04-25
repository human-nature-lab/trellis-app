<template>
  <v-container>
    <v-layout>
      <vue-recyclist
        :list="respondents"
        :tombstone="false">
        <template slot="item" slot-scope="respondent">
          <Respondent
            :key="respondent.id"
            @selected="onSelect(respondent)"
            :respondent="respondent"/>
        </template>
      </vue-recyclist>
    </v-layout>
  </v-container>
</template>

<script>
  import Respondent from './Respondent'
  import RespondentService from '../services/respondent/RespondentService'
  export default {
    name: 'respondents-view',
    data: function () {
      return {
        respondents: []
      }
    },
    methods: {
      loadMore: function () {
        RespondentService.search
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
