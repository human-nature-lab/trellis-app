<template>
  <v-container fluid class="respondent-search">
    <v-layout row>
      <v-text-field
        :placeholder="$t('search')"
        v-model="query"
        :loading="isLoading"
        @input="onQueryChange"></v-text-field>
      <v-btn
        v-if="canSelect"
        @click="onDone"
        color="primary"
        :disabled="isLoading">
        <v-progress-circular v-if="isLoading" indeterminate color="primary"></v-progress-circular>
        <span v-else>
          {{ $t('done') }}
        </span>
      </v-btn>
    </v-layout>
    <v-layout>
      <v-select
        :items="conditionTags"
        v-model="filters.conditionTags"
        :label="$t('condition_tags')"
        single-line
        dense
        chips
        tags
        @input="onQueryChange"
        :loading="conditionTagsLoading"
        autocomplete></v-select>
      <v-tooltip bottom>
        <v-btn
          slot="activator"
          icon
          @click="clearFilters">
          <v-icon>clear</v-icon>
        </v-btn>
        <span>
          {{ $t('clear') }}
        </span>
      </v-tooltip>
    </v-layout>
    <v-layout v-if="filters.geos && filters.geos.length">
      <span>
        {{ $t('geo_search_filter') }}
      </span>
      <v-chip
        v-for="(geo, index) in filters.geos"
        :key="geo.id"
        @input="removeGeoFilter(index)"
        :close="canRemoveGeos">
        <geo-breadcrumbs :geo-id="geo" :show-ancestors="false"></geo-breadcrumbs>
      </v-chip>
    </v-layout>
    <v-layout v-if="selected.length > 0">
      <v-flex>
        <v-chip
          v-for="(r) in selected"
          :key="r.id"
          @input="onSelectRespondent(r)"
          :close="true">
          {{ getRespondentName(r) }}
        </v-chip>
      </v-flex>
    </v-layout>
    <v-layout row>
      <v-spacer></v-spacer>
      <v-btn
        v-if="canAddRespondent"
        slot="activator"
        color="primary"
        @click="showAssociatedRespondentDialog = true"
        :loading="isLoading">
        <span v-if="respondentId">
          {{ $t('add_other_respondent') }}
        </span>
        <span v-else>
          {{ $t('add_respondent') }}
        </span>
      </v-btn>
    </v-layout>
    <v-alert v-show="error">
      {{error}}
    </v-alert>
    <v-container class="respondents" fluid grid-list-sm>
      <v-layout row wrap>
        <respondent-item
          v-for="respondent in respondentResults"
          :key="respondent.id"
          :formsButtonVisible="formsButtonVisible"
          :infoButtonVisible="infoButtonVisible"
          @selected="onSelectRespondent(respondent)"
          :selected="isSelected(respondent)"
          :respondent="respondent"></respondent-item>
      </v-layout>
      <v-layout v-if="!respondentResults.length" ma-3>
        {{ $t('no_results') }}: {{query}}
      </v-layout>
    </v-container>
    <v-dialog
      v-model="showAssociatedRespondentDialog">
      <v-card>
        <add-respondent-form
          @close="addRespondentClose"
          :studyId="studyId"
          :redirectToRespondentInfo="false"
          :associatedRespondentId="respondentId"></add-respondent-form>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
  import debounce from 'lodash/debounce'
  import orderBy from 'lodash/orderBy'
  import merge from 'lodash/merge'
  import ConditionTagService from '../../services/condition-tag'
  import RespondentService from '../../services/respondent/RespondentService'
  import RespondentListItem from './RespondentListItem'
  import RespondentItem from './RespondentItem'
  import AddRespondentForm from './AddRespondentForm'
  import GeoBreadcrumbs from '../geo/GeoBreadcrumbs'
  import router from '../../router'
  import TranslationService from '../../services/TranslationService'
  import singleton from '../../static/singleton'
  import PhotoService from '../../services/photo/PhotoService'

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
      searchQuery: {
        type: String,
        required: false,
        default: undefined
      },
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
          includeChildren: false,
          onlyCurrentGeo: true
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
        global: singleton,
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
      leaving () {
        PhotoService.cancelAllOutstanding()
      },
      removeGeoFilter (index) {
        this.filters.geos.splice(index, 1)
        this.search().then(() => {
          updateRoute(this)
        })
      },
      translate (translation) {
        return TranslationService.getAny(translation, this.global.locale.id)
      },
      onQueryChange: debounce(function () {
        this.isLoading = true
        this.search()
      }, 400),
      search () {
        if (this.shouldUpdateRoute) {
          updateRoute(this)
        }
        return this.getCurrentPage()
      },
      loadConditionTags () {
        if (this.conditionTagsLoaded) return
        this.conditionTagsLoading = true
        return ConditionTagService.respondent().then(tags => {
          this.conditionTags = tags.map(c => c.name)
          this.conditionTagsLoaded = true
        }).catch(err => {
          this.log(err)
          this.error = err
        }).then(() => {
          this.conditionTagsLoading = false
        })
      },
      clearFilters () {
        this.filters.conditionTags = []
      },
      async getCurrentPage () {
        let study = this.global.study
        this.isLoading = true
        PhotoService.cancelAllOutstanding()
        try {
          this.results = await RespondentService.getSearchPage(study.id, this.query, this.filters, this.currentPage, this.requestPageSize, this.respondentId)
          this.error = null
        } catch (err) {
          this.log(err)
          this.error = err
          alert('Unable to load respondents')
        } finally {
          this.isLoading = false
        }
      },
      onSelectRespondent (respondent) {
        this.$emit('selectRespondent', respondent)
        if (!this.canSelect) {
          router.push({name: 'Respondent', params: {respondentId: respondent.id, studyId: this.studyId}})
          return
        }

        let sIndex = this.selected.findIndex((r) => r.id === respondent.id)
        let aIndex = this.added.findIndex((r) => r.id === respondent.id)
        let rIndex = this.removed.findIndex((r) => r.id === respondent.id)
        if (aIndex > -1) {
          this.added.splice(aIndex, 1)
        } else if (rIndex > -1) {
          this.removed.splice(rIndex, 1)
        } else if (sIndex > -1) {
          this.removed.push(respondent)
        } else {
          // Do not add another respondent if we're at the limit
          if (this.limit && (this.selected.length + 1) > this.limit) return
          this.added.push(respondent)
        }
      },
      onDone () {
        this.$emit('selected', this.added.map((r) => r.id), this.removed.map((r) => r.id))
        this.added = []
        this.removed = []
      },
      isSelected (respondent) {
        return this.selected.findIndex((r) => r.id === respondent.id) > -1
      },
      addRespondentClose (respondent) {
        // TODO: Maybe add this to cache (if there is one)
        if (!this.query.length) {
          this.results.push(respondent)
        }
        this.showAssociatedRespondentDialog = false
      },
      getRespondentName (respondent) {
        let rName = respondent.names.find(n => n.isDisplayName)
        return rName ? rName.name : this.respondent.name
      },
    },
    watch : {
      'searchQuery': function(searchTerm) {
        if (searchTerm !== undefined) {
          this.query = searchTerm
        }
      }
    },
    computed: {
      studyId () {
        return this.global.study.id
      },
      selected () {
        let selected = this.selectedRespondents.concat(this.added)
        return selected.filter((r) => this.removed.findIndex((removed) => removed.id === r.id) === -1)
      },
      respondentResults () {
        return orderBy(this.results, ['score', 'name'], ['desc', 'asc'])
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

<style lang="sass">
  /*.fab-offset*/
    /*margin-right: 13px*/
    /*margin-bottom: 35px*/
</style>
