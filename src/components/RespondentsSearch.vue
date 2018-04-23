<template>
  <v-flex xs12 sm12>
    <v-form>
      <v-text-field
        v-model="query"
        @change="onQueryChange"></v-text-field>
      <p>TODO: Filters</p>
    </v-form>
    <v-card>
      <RespondentsView
        :respondents="respondentResults"
        @respondentsSelected="onRespondentsSelected"/>
    </v-card>
  </v-flex>
</template>

<script>
  import RespondentsView from './RespondentsView'
  import _ from 'lodash'
  import RespondentService from '@/services/respondent/RespondentService'
  export default {
    name: 'respondents-search',
    data: function () {
      return {
        respondentResults: [],
        query: '',
        error: '',
        filters: {}
      }
    },
    components: {
      RespondentsView
    },
    methods: {
      onRespondentsSelected: function (respondents) {
        console.log('selected the following respondents', respondents)
      },
      onQueryChange: _.debounce(function () {
        this.search()
      }, 800),
      search: function () {
        if (!this._existingRequestPromise) {
          this._existingRequestPromise = RespondentService.searchRespondents(this.query, this.filters)
            .then(respondents => {
              this.respondentResults = respondents
            }).catch(err => {
              console.error(err)
              this.error = err
            }).then(() => {
              this._existingRequestPromise = null
              if (this._shouldMakeAnotherRequestAfterDone) {
                console.log('making queued request')
                this.search() // Don't debounce this time
              }
              this._shouldMakeAnotherRequestAfterDone = false
            })
        } else {
          this._shouldMakeAnotherRequestAfterDone = true
          console.log('request in progress. will make next request when the current one finishes')
        }
      }
    }
  }
</script>

<style scoped>

</style>
