<template>
  <v-container class="relative">
    <v-toolbar class="respondent-search" extended fixed dense inline>
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
    <v-layout>
      <v-flex xs12 sm12>
        <vue-recyclist
          class="respondent-list"
          :list="respondentResults"
          :loadmore="onLoadMore"
          :size="scrollPageSize"
          :tombstone="false">
          <template slot="item" slot-scope="respondent">
            <RespondentListItem
              :key="respondent.data.id"
              @selected="onSelectRespondent(respondent.data)"
              :respondent="respondent.data"/>
          </template>
        </vue-recyclist>
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
  import VueRecyclist from 'vue-recyclist'
  import _ from 'lodash'
  import RespondentService from '@/services/respondent/RespondentService'
  import RespondentListItem from './RespondentListItem'
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
        shownRespondents: [],
        query: '',
        error: null,
        filters: {},
        selected: [],
        scrollPageSize: 10,
        requestPage: 0,
        requestPageSize: 50
      }
    },
    methods: {
      onQueryChange: _.debounce(function () {
        this.search()
      }, 100),
      search: function () {
        this.respondentResults = []
        this.page = 0
        this.onLoadMore()
      },
      onLoadMore: function () {
        if (this.shownRespondents.length >= this.respondentResults.length) {
          RespondentService.getSearchPage(this.query, this.filters, this.page, this.requestPageSize)
            .then(respondents => {
              this.respondentResults = this.respondentResults.concat(respondents)
              console.log(JSON.stringify(respondents, null, 2))
              this.error = null
              this.appendToShown()
            }).catch(err => {
              this.error = err.toLocaleString()
            })
        } else {
          this.appendToShown()
        }
      },
      appendToShown: function () {
        for (let respondent of this.respondentResults.slice(this.shownRespondents.length - 1, this.scrollPageSize)) {
          this.shownRespondents.push(respondent)
        }
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
      VueRecyclist,
      RespondentListItem
    }
  }
</script>

<style lang="sass" scoped>
.relative
  position: relative
</style>
