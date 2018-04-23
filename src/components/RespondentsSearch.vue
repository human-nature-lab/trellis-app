<template>
  <v-container>
    <v-layout>
      <v-flex xs12 sm12>
        <v-form>
          <div class="error">
            {{error}}
          </div>
          <v-text-field
            placeholder="Search..."
            v-model="query"
            @input="onQueryChange"></v-text-field>
          <p>TODO: Filters</p>
        </v-form>
        <RespondentsView
          :respondents="respondentResults"
          @selected="onSelected"
          v-if="respondentResults.length"/>
        <v-layout v-if="!respondentResults.length">
          No results present for the query: {{query}}
        </v-layout>
      </v-flex>
    </v-layout>
    <v-layout>
      <v-flex>
        <v-btn @click="onDone">Done</v-btn>
      </v-flex>
    </v-layout>
  </v-container>
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
        error: null,
        filters: {},
        selected: []
      }
    },
    components: {
      RespondentsView
    },
    methods: {
      onQueryChange: _.debounce(function () {
        this.search()
      }, 100),
      search: function () {
        RespondentService.searchRespondents(this.query, this.filters)
          .then(respondents => {
            this.respondentResults = respondents
            console.log(JSON.stringify(respondents, null, 2))
          }).catch(err => {
            console.error(err)
            this.error = err
          }).then(() => {
            if (this._shouldMakeAnotherRequestAfterDone) {
              console.log('making queued request')
              this.search() // Don't debounce this time
            }
          })
      },
      onSelected: function (respondent) {
        this.selected.push(respondent)
        this.onDone()
      },
      onDone: function () {
        this.$emit('selected', this.selected)
      }
    }
  }
</script>

<style scoped>

</style>
