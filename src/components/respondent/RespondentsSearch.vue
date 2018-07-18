<template>
  <v-container fluid class="respondent-search">
    <v-layout row>
      <v-text-field
        placeholder="Search..."
        v-model="query"
        :loading="isLoading"
        @input="onQueryChange"></v-text-field>
      <v-btn
        v-if="canSelect"
        @click="onDone"
        :disabled="isLoading">
        <v-progress-circular v-if="isLoading" indeterminate color="primary" />
        <span v-else>Done</span>
      </v-btn>
    </v-layout>
    <v-layout>
      <v-select
        :items="conditionTags"
        v-model="filters.conditionTags"
        label="Condition Tags"
        single-line
        dense
        chips
        tags
        @input="onQueryChange"
        :loading="conditionTagsLoading"
        autocomplete/>
      <v-tooltip bottom>
        <v-btn
          slot="activator"
          icon
          @click="clearFilters">
          <v-icon>clear</v-icon>
        </v-btn>
        <span>Clear filters</span>
      </v-tooltip>
    </v-layout>
    <v-layout v-if="filters.geos && filters.geos.length">
      Search limited to:
      <v-chip
        v-for="(geo, index) in filters.geos"
        :key="geo.id"
        @input="removeGeoFilter(index)"
        :close="canRemoveGeos">
        <GeoBreadcrumbs :geo-id="geo" :show-ancestors="false"/>
      </v-chip>
    </v-layout>
    <v-alert v-if="error">
      {{error}}
    </v-alert>
    <v-card class="respondents" fluid grid-list-sm>
      <v-layout row wrap>
        <RespondentItem
          v-for="respondent in respondentResults"
          :key="respondent.id"
          :formsButtonVisible="formsButtonVisible"
          :infoButtonVisible="infoButtonVisible"
          @selected="onSelectRespondent(respondent)"
          :selected="isSelected(respondent)"
          :respondent="respondent" />
      </v-layout>
      <v-layout v-if="!respondentResults.length" ma-3>
        No results present for the query: {{query}}
      </v-layout>
      <v-layout row>
        <v-spacer />
        <v-tooltip top v-if="canAddRespondent">
          <v-btn
            slot="activator"
            absolute
            fab
            bottom
            right
            :loading="isLoading"
            color="primary">
            <v-icon>add</v-icon>
          </v-btn>
          <span>Add temporary respondent</span>
        </v-tooltip>
      </v-layout>
    </v-card>
    <v-dialog
      v-model="showAssociatedRespondentDialog">
      <v-card>
        <AddRespondentForm
          @close="addRespondentClose"
          :studyId="studyId"
          :associatedRespondentId="respondentId" />
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
  import _, {merge} from 'lodash'
  import ConditionTagService from '../../services/condition-tag/ConditionTagService'
  import RespondentService from '../../services/respondent/RespondentService'
  import RespondentListItem from './RespondentListItem'
  import RespondentItem from './RespondentItem'
  import AddRespondentForm from './AddRespondentForm'
  import GeoBreadcrumbs from '../geo/GeoBreadcrumbs'
  import router from '../../router'
  import TranslationService from '../../services/TranslationService'

  function hasAnyFilter (filters) {
    for (let key in filters) {
      if (filters[key] && filters[key].length) {
        return true
      }
    }
    return false
  }

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
    if (hasAnyFilter(vm.filters)) {
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
    if (vm.$route.query.filters) {
      merge(vm.filters, JSON.parse(vm.$route.query.filters))
    }
  }

  export default {
    name: 'respondents-search',
    props: {
      canSelect: {
        type: Boolean,
        default: false
      },
      limit: {
        type: Number,
        default: 0
      },
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
        default: () => ({
          conditionTags: [],
          geos: [],
          include_children: false
        })
      },
      selectedRespondents: {
        type: Array,
        default: () => []
      },
      respondentId: {
        type: String
      },
      canAddRespondent: {
        type: Boolean,
        default: true
      },
      canRemoveGeos: {
        type: Boolean,
        default: true
      }
    },
    head: {
      title: {
        inner: 'Respondent search'
      }
    },
    data () {
      return {
        error: null,
        results: [],
        conditionTags: [],
        query: '',
        filters: Object.assign({
          conditionTags: [],
          geos: []
        }, this.baseFilters),
        added: [],
        removed: [],
        currentPage: 0,
        requestPageSize: 20,
        conditionTagsLoaded: false,
        conditionTagsLoading: false,
        isLoading: false,
        showAssociatedRespondentDialog: false
      }
    },
    created () {
      if (this.shouldUpdateRoute) {
        loadRoute(this)
      }
      this.loadConditionTags()
      this.getCurrentPage()
    },
    methods: {
      removeGeoFilter (index) {
        this.filters.geos.splice(index, 1)
        this.search().then(() => {
          updateRoute(this)
        })
      },
      translate (translation) {
        return TranslationService.getAny(translation, this.global.locale.id)
      },
      onQueryChange: _.debounce(function () {
        this.isLoading = true
        this.search()
      }, 400),
      search () {
        if (this.shouldUpdateRoute) {
          updateRoute(this)
        }
        this.getCurrentPage()
      },
      loadConditionTags () {
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
      clearFilters () {
        this.filters.conditionTags = []
      },
      getCurrentPage () {
        let study = this.global.study
        this.isLoading = true
        RespondentService.getSearchPage(study.id, this.query, this.filters, this.currentPage, this.requestPageSize, this.respondentId)
          .then(respondents => {
            this.results = respondents
            this.error = null
          }).catch(err => {
            this.error = err.toLocaleString()
          }).then(() => {
            this.isLoading = false
          })
      },
      onSelectRespondent (respondent) {
        this.$emit('selectRespondent', respondent)
        if (!this.canSelect) {
          router.push({name: 'Respondent', params: {respondentId: respondent.id, studyId: this.studyId}})
          return
        }
        if (this.limit && this.selected.length > this.limit) return

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
      onDone () {
        this.$emit('selected', this.added, this.removed)
        this.added = []
        this.removed = []
      },
      isSelected (respondent) {
        return this.selected.indexOf(respondent.id) > -1
      },
      addRespondentClose (respondent) {
        // TODO: Maybe add this to cache (if there is one)
        if (!this.query.length) {
          this.results.push(respondent)
        }
        this.showAssociatedRespondentDialog = false
      }
    },
    computed: {
      studyId () {
        return this.global.study.id
      },
      selected () {
        let selected = this.selectedRespondents.concat(this.added)
        return selected.filter(id => this.removed.indexOf(id) === -1)
      },
      respondentResults () {
        return _.orderBy(this.results, ['score', 'name'], ['desc', 'asc'])
      }
    },
    components: {
      RespondentListItem,
      RespondentItem,
      AddRespondentForm,
      GeoBreadcrumbs
    }
  }
</script>

<style lang="sass" scoped>
.respondent-search
  /*position: fixed*/
  z-index: 10
.respondents
  /*padding-top: 130px*/
</style>
