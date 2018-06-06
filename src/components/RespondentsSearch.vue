<template>
  <v-card fluid ma-0 pa-0>
    <v-toolbar
      class="respondent-search pa-2"
      extended
      dense
      inline>
      <v-text-field
        placeholder="Search..."
        v-model="query"
        :loading="isLoading"
        @input="onQueryChange"></v-text-field>
      <v-layout slot="extension">
        <v-flex>
          <v-select
            :items="conditionTags"
            v-model="filters.conditionTags"
            label="Condition Tags"
            chips
            tags
            @input="onQueryChange"
            :loading="conditionTagsLoading"
            autocomplete/>
        </v-flex>
        <v-flex sm1>
          <v-btn
            @click="clearFilters">
            <v-icon>clear</v-icon>
          </v-btn>
        </v-flex>
      </v-layout>
      <v-alert v-if="error">
        {{error}}
      </v-alert>
    </v-toolbar>
    <v-container class="respondents" fluid grid-list-sm>
      <v-layout row wrap>
        <Respondent
          v-for="respondent in respondentResults"
          :key="respondent.id"
          :formsButtonVisible="formsButtonVisible"
          :infoButtonVisible="infoButtonVisible"
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
  </v-card>
</template>

<script>
  import _ from 'lodash'
  import ConditionTagService from '../services/condition-tag/ConditionTagService'
  import RespondentService from '../services/respondent/RespondentService'
  import RespondentListItem from './RespondentListItem'
  import Respondent from './Respondent'
  import router from '../router/router'

  /**
   * Keeps the vue router link in sync with the current query. This means that navigating away from this page and then
   * returning to it will bring you to the same place you were before.
   * @param {VueComponent} vm - The vue instance to derive the route from
   */
  function updateRoute (vm) {
    let query = {}
    if (vm.query) {
      query.query = vm.query
    }
    if (vm.filters.conditionTags.length) {
      query.filters = JSON.stringify(vm.filters)
    }
    router.replace({
      name: vm.$route.name,
      params: vm.$route.params,
      query: query
    })
  }

  /**
   * Mutates the vm to conform to the updates made by the updateRoute method
   * @param {VueComponent} vm - The vue instance we're modifying
   */
  function loadRoute (vm) {
    vm.query = vm.$route.query.query || ''
    vm.filters = vm.$route.query.filters ? JSON.parse(vm.$route.query.filters) : {
      conditionTags: []
    }
  }

  export default {
    name: 'respondents-search',
    props: {
      formsButtonVisible: {
        type: Boolean,
        default: true
      },
      infoButtonVisible: {
        type: Boolean,
        default: true
      },
      shouldUpdateRoute: {
        type: Boolean,
        default: true
      },
      baseFilters: {
        type: Object,
        default: () => ({})
      },
      selectedRespondents: {
        type: Array,
        default: () => []
      }
    },
    head: {
      title: {
        inner: 'Respondent search'
      }
    },
    data: function () {
      return {
        error: null,
        results: [],
        conditionTags: [],
        query: '',
        filters: Object.assign({
          conditionTags: [],
          locations: []
        }, this.baseFilters),
        added: [],
        removed: [],
        currentPage: 0,
        requestPageSize: 20,
        conditionTagsLoaded: false,
        conditionTagsLoading: false,
        isLoading: false
      }
    },
    created: function () {
      if (this.shouldUpdateRoute) {
        loadRoute(this)
      }
      this.loadConditionTags()
      this.getCurrentPage()
    },
    methods: {
      onQueryChange: _.debounce(function () {
        this.isLoading = true
        this.search()
      }, 400),
      search: function () {
        if (this.shouldUpdateRoute) {
          updateRoute(this)
        }
        this.getCurrentPage()
      },
      loadConditionTags: function () {
        if (this.conditionTagsLoaded) return
        this.conditionTagsLoading = true
        return ConditionTagService.respondent().then(tags => {
          this.conditionTags = Array.from(new Set(tags))
          this.conditionTagsLoaded = true
        }).catch(err => {
          this.error = err
        }).then(() => {
          this.conditionTagsLoading = false
        })
      },
      clearFilters: function () {
        this.filters.conditionTags = []
      },
      getCurrentPage: function () {
        let study = this.global.study
        this.isLoading = true
        RespondentService.getSearchPage(study.id, this.query, this.filters, this.currentPage, this.requestPageSize)
          .then(respondents => {
            this.results = respondents
            this.error = null
          }).catch(err => {
            this.error = err.toLocaleString()
          }).then(() => {
            this.isLoading = false
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
  z-index: 10
.respondents
  padding-top: 130px
</style>
