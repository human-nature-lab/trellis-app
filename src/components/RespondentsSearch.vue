<template>
  <v-container>
    <v-toolbar class="respondent-search" extended dense inline>
      <v-text-field
        placeholder="Search..."
        v-model="query"
        @input="onQueryChange"></v-text-field>
      <v-layout slot="extension">
        <p>TODO: Filters</p>
        <div class="error">
          {{error}}
        </div>
      </v-layout>
    </v-toolbar>
    <v-container fluid>
      <v-layout row wrap>
        <Respondent
          v-for="respondent in respondentResults"
          :key="respondent.id"
          @selected="onSelectRespondent(respondent)"
          :respondent="respondent"/>
      </v-layout>
    </v-container>
    <v-layout v-if="!respondentResults.length">
      No results present for the query: {{query}}
    </v-layout>
    <v-layout>
      <v-flex>
        <v-btn @click="onDone">Done</v-btn>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
  import _ from 'lodash'
  import RespondentService from '@/services/respondent/RespondentService'
  import RespondentListItem from './RespondentListItem'
  import Respondent from './Respondent'
  export default {
    name: 'respondents-search',
    props: {
      selectedRespondents: {
        type: Array
      }
    },
    data: function () {
      return {
        respondentResults: [],
        query: '',
        error: null,
        filters: {},
        selected: [],
        currentPage: 0,
        requestPageSize: 50
      }
    },
    methods: {
      onQueryChange: _.debounce(function () {
        this.search()
      }, 400),
      search: function () {
        this.getCurrentPage()
      },
      getCurrentPage: function () {
        RespondentService.getSearchPage(this.query, this.filters, this.currentPage, this.requestPageSize)
          .then(respondents => {
            this.respondentResults = respondents
            console.log(JSON.stringify(respondents, null, 2))
            this.error = null
          }).catch(err => {
            this.error = err.toLocaleString()
          })
      },
      onSelectRespondent: function (respondent) {
        this.selected.push(respondent)
      },
      onDone: function () {
        this.$emit('selected', this.selected)
        this.selected = []
      }
    },
    components: {
      RespondentListItem,
      Respondent
    }
  }
</script>

<style lang="sass" scoped>
.relative
  position: relative
</style>
