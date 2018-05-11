<template>
  <v-container fluid ma-0 pa-0>
    <v-toolbar
      class="respondent-search pa-2"
      extended
      dense
      inline>
      <v-text-field
        placeholder="Search..."
        v-model="query"
        autofocus
        @input="onQueryChange"></v-text-field>
      <v-layout slot="extension">
        <p>TODO: Filters</p>
        <div class="error">
          {{error}}
        </div>
      </v-layout>
    </v-toolbar>
    <v-container class="respondents" fluid grid-list-sm>
      <v-layout row wrap>
        <Respondent
          v-for="respondent in respondentResults"
          :key="respondent.id"
          @selected="onSelectRespondent(respondent)"
          :selected="isSelected(respondent)"
          :respondent="respondent"/>
      </v-layout>
    </v-container>
    <v-layout v-if="!respondentResults.length" ma-3>
      No results present for the query: {{query}}
    </v-layout>
    <v-layout ma-3>
      <v-flex>
        <v-btn @click="onDone" :disabled="isLoading">
          <span v-if="!isLoading">Done</span>
          <v-progress-circular v-if="isLoading" indeterminate color="primary" />
        </v-btn>
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
      },
      isLoading: {
        type: Boolean,
        default: false
      },
      error: {
        type: String,
        default: null
      }
    },
    data: function () {
      return {
        results: [],
        query: '',
        filters: {},
        added: [],
        removed: [],
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
            this.results = respondents
            this.error = null
          }).catch(err => {
            this.error = err.toLocaleString()
          })
      },
      onSelectRespondent: function (respondent) {
        let sIndex = this.selected.indexOf(respondent.id)
        let aIndex = this.added.indexOf(respondent.id)
        let rIndex = this.removed.indexOf(respondent.id)
        if (aIndex > -1) {
          this.added.splice(aIndex, 1)
        } else if (rIndex > -1) {
          this.removed.splice(rIndex, 1)
        } else if (sIndex > -1) {
          this.removed.push(respondent.id)
        } else {
          this.added.push(respondent.id)
        }
      },
      onDone: function () {
        this.$emit('selected', this.added, this.removed)
        this.added = []
        this.removed = []
      },
      isSelected: function (respondent) {
        return this.selected.indexOf(respondent.id) > -1
      }
    },
    computed: {
      selected: function () {
        let selected = this.selectedRespondents
        for (let id of this.added) {
          selected.push(id)
        }
        return selected.filter(id => this.removed.indexOf(id) === -1)
      },
      respondentResults: function () {
        return _.orderBy(this.results, ['score', 'name'], ['desc', 'asc'])
      }
    },
    components: {
      RespondentListItem,
      Respondent
    }
  }
</script>

<style lang="sass" scoped>
.respondent-search
  position: fixed
  z-index: 1000
.respondents
  padding-top: 130px
</style>
