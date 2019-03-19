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
        class="text--primary"
        :disabled="isLoading">
        {{ $t('done') }}
      </v-btn>
      <v-btn icon @click="filtersIsOpen = !filtersIsOpen">
        <v-icon v-if="filtersIsOpen">keyboard_arrow_up</v-icon>
        <v-icon v-else>keyboard_arrow_down</v-icon>
      </v-btn>
    </v-layout>
    <v-scale-transition>
      <v-layout column v-if="filtersIsOpen">
        <v-flex>
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
              autocomplete>
              <v-chip
                slot="selection"
                slot-scope="props"
                outline
                color="primary">
                <v-avatar>
                  <v-icon>label</v-icon>
                </v-avatar>
                {{props.item}}
              </v-chip>
            </v-select>
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
          <v-layout row wrap v-if="showGeoFilterOptions">
            <v-flex>
              <v-checkbox
                v-model="filters.includeChildren"
                :label="$t('include_child_locations')" />
            </v-flex>
            <v-flex>
              <v-checkbox
                v-model="showPastResidents"
                :label="$t('show_past_residents')" />
            </v-flex>
          </v-layout>
        </v-flex>
      </v-layout>
    </v-scale-transition>
    <v-divider v-if="filters.geos && filters.geos.length" />
    <v-layout row wrap v-if="filters.geos && filters.geos.length">
      <v-flex class="subheading">
        <v-container>{{ $t('filters') }}</v-container>
      </v-flex>
      <v-spacer />
      <v-chip
        v-for="(geo, index) in filters.geos"
        :key="geo.id"
        color="primary"
        outline
        @input="removeGeoFilter(index)"
        :close="canRemoveGeos">
        <v-avatar>
          <v-icon>home</v-icon>
        </v-avatar>
        <GeoBreadcrumbs
          :geoId="geo"
          :maxDepth="2" />
      </v-chip>
    </v-layout>
    <v-divider v-if="selected.length > 0" />
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
        :disabled="isLoading">
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
        <RespondentItem
          v-for="respondent in respondentResults"
          :key="respondent.id"
          :formsButtonVisible="formsButtonVisible"
          :infoButtonVisible="infoButtonVisible"
          @selected="onSelectRespondent(respondent)"
          :selected="isSelected(respondent)"
          :respondent="respondent"
          :labels="getRespondentLabels(respondent)"/>
      </v-layout>
      <v-card v-if="pagination.page > 0 || respondentResults.length === pagination.size">
        <v-container>
          <v-layout>
            <v-pagination
              :length="pagination.maxPages + 2"
              :value="pagination.page + 1"
              total-visible="7"
              :disabled="isLoading"
              @input="updateCurrentPage" />
          </v-layout>
        </v-container>
      </v-card>
      <v-layout v-if="!respondentResults.length" ma-3>
        <v-container>
          {{ $t('no_results') }}: {{query}}
        </v-container>
      </v-layout>
    </v-container>
    <v-dialog
      v-model="showAssociatedRespondentDialog">
      <v-card>
        <AddRespondentForm
          @close="addRespondentClose"
          :studyId="studyId"
          :redirectToRespondentInfo="false"
          :onRespondentAdded="onRespondentAdded"
          :associatedRespondentId="respondentId"></AddRespondentForm>
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
  import TrellisLoadingCircular from '../TrellisLoadingCircle'
  import router from '../../router'
  import TranslationService from '../../services/TranslationService'
  import singleton from '../../static/singleton'
  import PhotoService from '../../services/photo/PhotoService'
  import DocsLinkMixin from '../../mixins/DocsLinkMixin'
  import DocsFiles from '../documentation/DocsFiles'

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
    mixins: [DocsLinkMixin(DocsFiles.respondents.search)],
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
          orConditionTags: [],
          geos: [],
          includeChildren: false,
          onlyCurrentGeo: true,
          randomize: true
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
      },
      onRespondentAdded: Function
    },
    head: {
      title: {
        inner: 'Respondent search'
      }
    },
    data: function () {
      return {
        global: singleton,
        error: null,
        results: [],
        conditionTags: [],
        query: '',
        filters: Object.assign({
          conditionTags: [],
          orConditionTags: [],
          geos: []
        }, this.baseFilters),
        added: [],
        removed: [],
        conditionTagsLoaded: false,
        conditionTagsLoading: false,
        isLoading: false,
        showAssociatedRespondentDialog: false,
        filtersIsOpen: false,
        pagination: {
          page: 0,
          seed: null,
          size: 20,
          maxPages: 0,
          total: 0
        }
      }
    },
    created () {
      if (this.shouldUpdateRoute) {
        loadRoute(this)
        if (this.filters.conditionTags.length) {
          this.filtersIsOpen = true
        }
      }
      this.getCurrentPage()
      this.loadConditionTags()
    },
    methods: {
      leaving () {
        PhotoService.cancelAllOutstanding()
      },
      removeGeoFilter (index) {
        this.filters.geos.splice(index, 1)
      },
      translate (translation) {
        return TranslationService.getAny(translation, this.global.locale.id)
      },
      onQueryChange: debounce(function () {
        this.isLoading = true
        this.search()
      }, 1000),
      search () {
        if (this.shouldUpdateRoute) {
          updateRoute(this)
        }
        this.pagination.page = 0
        this.pagination.maxPages = 0
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
      async updateCurrentPage (pageVal) {
        this.pagination.page = pageVal - 1
        await this.getCurrentPage()
        if (this.results.length === this.pagination.size && this.pagination.page > this.pagination.maxPages) {
          this.pagination.maxPages = this.pagination.page
        }
      },
      async getCurrentPage () {
        let study = this.global.study
        this.isLoading = true
        PhotoService.cancelAllOutstanding()
        try {
          const page = await RespondentService.getSearchPage(study.id, this.query, this.filters, this.pagination, this.respondentId)
          this.pagination.seed = page.seed
          this.results = page.data
          this.error = null
        } catch (err) {
          this.log(err)
          this.error = err
          this.alert('error', 'Unable to load respondents')
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
      getRespondentLabels (respondent) {
        if (!this.showLabels) return []
        const labels = []
        // let isPastResident = true
        // for (let geo of respondent.geos) {
        //   if (geo.isCurrent && this.filters.geos.indexOf(geo.geoId) > -1) {
        //     isPastResident = false
        //     break
        //   }
        // }
        // if (isPastResident) {
        //   labels.push(this.$t('past_resident'))
        // }
        return labels
      }
    },
    watch : {
      searchQuery (searchTerm) {
        if (searchTerm !== undefined) {
          this.query = searchTerm
        }
      },
      filters: {
        handler (newFilters, oldFilters) {
          this.search()
        },
        deep: true
      }
    },
    computed: {
      studyId () {
        return this.global.study.id
      },
      selected () {
        let selected = this.selectedRespondents.concat(this.added)
        return selected.filter(r => r && this.removed.findIndex((removed) => removed.id === r.id) === -1)
      },
      respondentResults () {
        return orderBy(this.results, ['score'], ['desc'])
      },
      showLabels () {
        return this.filters.geos.length > 0
      },
      showPastResidents: {
        get () {
          return this.filters ? !this.filters.onlyCurrentGeo : false
        },
        set (val) {
          this.filters.onlyCurrentGeo = !val
        }
      },
      showGeoFilterOptions () {
        return this.filters && !!this.filters.geos.length
      }
    },
    components: {
      RespondentListItem,
      RespondentItem,
      AddRespondentForm,
      GeoBreadcrumbs,
      TrellisLoadingCircular
    }
  }
</script>

<style lang="sass">
  /*.fab-offset*/
    /*margin-right: 13px*/
    /*margin-bottom: 35px*/
</style>
