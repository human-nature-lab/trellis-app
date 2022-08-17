<template>
  <v-container fluid class="respondent-search align-content-start">
    <v-row no-gutters>
      <v-text-field
        :placeholder="$t('search')"
        v-model="query"
        :loading="isLoading"
        @input="onQueryChange"
        autocomplete="off"
        spellcheck="false"
        clearable
      />
      <v-btn
        v-if="canSelect"
        @click="onDone"
        class="text--primary"
        :disabled="isLoading"
      >{{ $t("done") }}</v-btn>
      <v-btn icon @click="filtersIsOpen = !filtersIsOpen">
        <v-icon v-if="filtersIsOpen">mdi-chevron-up</v-icon>
        <v-icon v-else>mdi-chevron-down</v-icon>
      </v-btn>
    </v-row>
    <v-slide-y-transition>
      <v-col v-if="filtersIsOpen">
        <v-col>
          <v-row>
            <ConditionTagAutocomplete v-model="filters.conditionTags" />
            <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <v-btn v-on="on" v-bind="attrs" icon @click="clearFilters">
                  <v-icon>mdi-close</v-icon>
                </v-btn>
              </template>
              <span>{{ $t("clear") }}</span>
            </v-tooltip>
          </v-row>
          <v-row v-if="showGeoFilterOptions">
            <v-col>
              <v-checkbox v-model="filters.includeChildren" :label="$t('include_child_locations')" />
            </v-col>
            <v-col>
              <v-checkbox v-model="showPastResidents" :label="$t('show_past_residents')" />
            </v-col>
          </v-row>
        </v-col>
      </v-col>
    </v-slide-y-transition>
    <v-row>
      <v-divider v-if="filters.geos && filters.geos.length" />
    </v-row>
    <v-row no-gutter v-if="filters.geos && filters.geos.length">
      <v-col class="subheading">
        <v-container>{{ $t("filters") }}</v-container>
      </v-col>
      <v-spacer />
      <v-chip
        v-for="(geo, index) in filters.geos"
        :key="geo.id"
        color="primary"
        outlined
        @click:close="removeGeoFilter(index)"
        :close="canRemoveGeos"
      >
        <v-avatar>
          <v-icon>mdi-home</v-icon>
        </v-avatar>
        <GeoBreadcrumbs :geoId="geo" :maxDepth="2" />
      </v-chip>
    </v-row>
    <v-row>
      <v-divider v-if="selected.length > 0" />
    </v-row>
    <v-col v-if="selected.length > 0">
      <v-col>
        <v-chip
          v-for="r in selected"
          :key="r.id"
          @click:close="onSelectRespondent(r)"
          close
        >{{ getRespondentName(r) }}</v-chip>
      </v-col>
    </v-col>
    <v-row class="justify-space-between">
      <v-col cols="auto">
        <v-pagination
          :length="pagination.maxPages + 2"
          :value="pagination.page + 1"
          total-visible="7"
          :disabled="isLoading || (pagination.page === 0 && respondentResults.length !== pagination.size)"
          @input="updateCurrentPage"
        />
      </v-col>
      <v-col cols="auto">
        <v-btn
          v-if="canAddRespondent"
          color="primary"
          @click="showAssociatedRespondentDialog = true"
          :disabled="isLoading"
        >
          <span v-if="respondentId">{{ $t("add_other_respondent") }}</span>
          <span v-else>{{ $t("add_respondent") }}</span>
        </v-btn>
      </v-col>
    </v-row>
    <v-container class="respondents" fluid grid-list-sm>
      <v-row>
        <RespondentItem
          v-for="respondent in respondentResults"
          :key="respondent.id"
          :formsButtonVisible="formsButtonVisible"
          :infoButtonVisible="infoButtonVisible"
          @selected="onSelectRespondent(respondent)"
          @delete="removeRespondent(respondent)"
          :selected="isSelected(respondent)"
          :respondent="respondent"
          :labels="getRespondentLabels(respondent)"
        />
      </v-row>
      <v-col v-if="!respondentResults.length" ma-4>
        <v-container>{{ $t("no_results") }}: {{ query }}</v-container>
      </v-col>
    </v-container>
    <TrellisModal
      :title="respondentId ? $t('add_other_respondent') : $t('add_respondent')"
      v-model="showAssociatedRespondentDialog"
    >
      <AddRespondentForm
        @close="addRespondentClose"
        :studyId="studyId"
        :redirectToRespondentInfo="false"
        :onRespondentAdded="onRespondentAdded"
        :associatedRespondentId="respondentId"
      />
    </TrellisModal>
  </v-container>
</template>

<script>
import { debounce, orderBy, merge } from 'lodash'
import RespondentService from '../../services/respondent'
import RespondentListItem from './RespondentListItem.vue'
import RespondentItem from './RespondentItem.vue'
import AddRespondentForm from './AddRespondentForm.vue'
import GeoBreadcrumbs from '../geo/GeoBreadcrumbs.vue'
import TrellisLoadingCircular from '../TrellisLoadingCircle.vue'
import ConditionTagAutocomplete from '../ConditionTagAutocomplete.vue'
import { routeQueue } from '../../router'
import TranslationService from '../../services/TranslationService'
import singleton from '../../static/singleton'
import PhotoService from '../../services/photo'
import DocsLinkMixin from '../../mixins/DocsLinkMixin'
import DocsFiles from '../documentation/DocsFiles'
import TrellisModal from '../TrellisModal.vue'

function hasAnyFilter(filters) {
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
function updateRoute(vm) {
  let query = {}
  if (vm.query) {
    query.query = vm.query
  }
  if (hasAnyFilter(vm.filters)) {
    query.filters = JSON.stringify(vm.filters)
  }
  routeQueue.replace({
    name: vm.$route.name,
    params: vm.$route.params,
    query: query
  })
}

/**
 * Mutates the vm to conform to the updates made by the updateRoute method
 * @param {VueComponent} vm - The vue instance we're modifying
 */
function loadRoute(vm) {
  vm.query = vm.$route.query.query || ''
  if (vm.$route.query.filters) {
    merge(vm.filters, JSON.parse(vm.$route.query.filters))
  }
}

export default {
  name: 'respondents-search',
  mixins: [DocsLinkMixin(DocsFiles.respondents.search)],
  components: {
    RespondentListItem,
    RespondentItem,
    AddRespondentForm,
    GeoBreadcrumbs,
    TrellisLoadingCircular,
    TrellisModal,
    ConditionTagAutocomplete
  },
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
      type: String,
      required: false
    },
    canAddRespondent: {
      type: Boolean,
      default: true
    },
    canRemoveGeos: {
      type: Boolean,
      default: true
    },
    onRespondentAdded: {
      type: Function,
      required: false
    }
  },
  head: {
    title: {
      inner: 'Respondent search'
    }
  },
  data() {
    return {
      global: singleton,
      results: [],
      query: '',
      filters: Object.assign({
        conditionTags: [],
        orConditionTags: [],
        geos: []
      }, this.baseFilters),
      added: [],
      removed: [],
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
  created() {
    if (this.shouldUpdateRoute) {
      loadRoute(this)
      if (this.filters.conditionTags.length) {
        this.filtersIsOpen = true
      }
    }
    this.getCurrentPage()
  },
  methods: {
    leaving() {
      PhotoService.cancelAllOutstanding()
    },
    removeGeoFilter(index) {
      this.filters.geos.splice(index, 1)
    },
    translate(translation) {
      return TranslationService.getAny(translation, this.global.locale.id)
    },
    onQueryChange: debounce(function () {
      this.isLoading = true
      this.search()
    }, 1000),
    search() {
      if (this.shouldUpdateRoute) {
        updateRoute(this)
      }
      this.pagination.page = 0
      this.pagination.maxPages = 0
      return this.getCurrentPage()
    },
    clearFilters() {
      this.filters.conditionTags = []
    },
    async updateCurrentPage(pageVal) {
      this.pagination.page = pageVal - 1
      await this.getCurrentPage()
      if (this.results.length === this.pagination.size && this.pagination.page > this.pagination.maxPages) {
        this.pagination.maxPages = this.pagination.page
      }
    },
    async getCurrentPage() {
      let study = this.global.study
      this.isLoading = true
      PhotoService.cancelAllOutstanding()
      try {
        const page = await RespondentService.getSearchPage(study.id, this.query, this.filters, this.pagination, this.respondentId)
        this.pagination.seed = page.seed
        this.results = page.data
      } catch (err) {
        if (this.isNotAuthError(err)) {
          this.logError(err)
        }
      } finally {
        this.isLoading = false
      }
    },
    onSelectRespondent(respondent) {
      this.$emit('selectRespondent', respondent)
      if (!this.canSelect) {
        return routeQueue.redirect({ name: 'Respondent', params: { respondentId: respondent.id, studyId: this.studyId } })
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
    onDone() {
      this.$emit('selected', this.added.map((r) => r.id), this.removed.map((r) => r.id))
      this.added = []
      this.removed = []
    },
    isSelected(respondent) {
      return this.selected.findIndex((r) => r.id === respondent.id) > -1
    },
    addRespondentClose(respondent) {
      // TODO: Maybe add this to cache (if there is one)
      if (!this.query.length) {
        this.results.push(respondent)
      }
      this.showAssociatedRespondentDialog = false
    },
    getRespondentName(respondent) {
      let rName = respondent.names.find(n => n.isDisplayName)
      return rName ? rName.name : this.respondent.name
    },
    getRespondentLabels(respondent) {
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
  watch: {
    searchQuery(searchTerm) {
      if (searchTerm !== undefined) {
        this.query = searchTerm
      }
    },
    filters: {
      handler(newFilters, oldFilters) {
        this.search()
      },
      deep: true
    }
  },
  computed: {
    studyId() {
      return this.global.study.id
    },
    selected() {
      let selected = this.selectedRespondents.concat(this.added)
      return selected.filter(r => r && this.removed.findIndex((removed) => removed.id === r.id) === -1)
    },
    respondentResults() {
      return orderBy(this.results, ['score'], ['desc'])
    },
    showLabels() {
      return this.filters.geos.length > 0
    },
    showPastResidents: {
      get() {
        return this.filters ? !this.filters.onlyCurrentGeo : false
      },
      set(val) {
        this.filters.onlyCurrentGeo = !val
      }
    },
    showGeoFilterOptions() {
      return this.filters && !!this.filters.geos.length
    }
  }
}
</script>
