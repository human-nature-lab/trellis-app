<template>
  <v-container
    fluid
    class="respondent-search align-content-start fill-height pa-0"
  >
    <ScrollContainer>
      <template #header>
        <v-col class="py-0">
          <v-row class="no-gutters align-center flex-nowrap">
            <v-text-field
              :placeholder="$t('search')"
              v-model="query"
              :loading="isLoading"
              @input="onQueryChange"
              autocomplete="off"
              spellcheck="false"
              clearable
            />
            <RespondentSearchFilters
              v-if="filters"
              :condition-tags="filters.conditionTags"
              @update:conditionTags="filters.conditionTags = $event"
              :include-children="filters.includeChildren"
              @update:includeChildren="filters.includeChildren = $event"
              :show-past-residents="showPastResidents"
              @update:showPastResidents="showPastResidents = $event"
              :show-geo-filter-options="showGeoFilterOptions"
              :geos="filters.geos"
              @update:geos="filters.geos = $event"
              :can-remove-geos="canRemoveGeos"
              :show-associated-option="showAssociatedOption"
              :associated-only="mode === 'associated'"
              @update:associatedOnly="mode = $event ? 'associated' : 'all'"
            />
            <v-btn
              v-if="canSelect"
              @click="onDone"
              class="text--primary ml-4"
              :disabled="isLoading"
              :fab="!$vuetify.breakpoint.smAndUp"
              :small="!$vuetify.breakpoint.smAndUp"
              color="success"
            >
              <span v-if="$vuetify.breakpoint.smAndUp">{{ $t("done") }}</span>
              <v-icon class="mx-1">
                mdi-check
              </v-icon>
            </v-btn>
          </v-row>
          <v-divider
            v-if="selected.length > 0"
            class="my-1"
          />
          <RespondentChipList
            v-model="selected"
            @remove="onSelectRespondent"
          />
        </v-col>
        <v-row
          v-if="canSelect"
          class="no-gutters"
        >
          <v-spacer />
          <v-btn
            @click="toggleAll"
            :disabled="!respondentResults.length"
          >
            {{ fullPageIsSelected ? $t('deselect_all') : $t('select_all') }}
          </v-btn>
        </v-row>
      </template>
      <v-container
        class="respondents px-2 py-0"
        fluid
        grid-list-sm
      >
        <v-row class="no-gutters">
          <RespondentItem
            v-for="respondent in respondentResults"
            :key="respondent.id"
            :forms-button-visible="formsButtonVisible"
            :info-button-visible="infoButtonVisible"
            @selected="onSelectRespondent(respondent)"
            @delete="removeRespondent(respondent)"
            :selected="isSelected(respondent)"
            :respondent="respondent"
            :labels="getRespondentLabels(respondent)"
          />
        </v-row>
        <v-col
          v-if="!respondentResults.length && !isLoading"
          ma-4
        >
          <v-container>{{ $t("no_results") }}: {{ query }}</v-container>
        </v-col>
        <v-row class="no-gutters justify-space-between px-0 py-4">
          <v-col
            cols="auto"
            class="px-0"
          >
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
        <v-row
          v-if="pagination.total > 0"
          class="no-gutters justify-space-between px-0 py-4"
        >
          <v-col
            cols="auto"
            class="px-0"
          >
            {{ $t("total_respondents", { n: pagination.total }) }}
          </v-col>
        </v-row>
      </v-container>
    </ScrollContainer>
    <TrellisModal
      :title="respondentId ? $t('add_other_respondent') : $t('add_respondent')"
      v-model="showAssociatedRespondentDialog"
    >
      <AddRespondentForm
        @close="addRespondentClose"
        :study-id="studyId"
        :redirect-to-respondent-info="false"
        :on-respondent-added="onRespondentAdded"
        :associated-respondent-id="respondentId"
      />
    </TrellisModal>
  </v-container>
</template>

<script>
import { debounce, orderBy, merge } from 'lodash'
import RespondentService from '@/services/respondent'
import RespondentItem from '@/components/respondent/RespondentItem.vue'
import AddRespondentForm from '@/components/respondent/AddRespondentForm.vue'
import RespondentSearchFilters from '@/components/respondent/RespondentSearchFilters.vue'
import RespondentChipList from '@/components/respondent/RespondentChipList.vue'
import { routeQueue } from '@/router'
import TranslationService from '@/services/TranslationService'
import singleton from '@/static/singleton'
import PhotoService from '@/services/photo'
import DocsLinkMixin from '@/mixins/DocsLinkMixin'
import DocsFiles from '@/components/documentation/DocsFiles'
import TrellisModal from '@/components/TrellisModal.vue'
import ScrollContainer from '@/components/styles/ScrollContainer.vue'
import { updateTitle } from '@/router/history'

function hasAnyFilter (filters) {
  for (const key in filters) {
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
  const query = {}
  if (vm.query) {
    query.query = vm.query
  }
  if (hasAnyFilter(vm.filters)) {
    query.filters = JSON.stringify(vm.filters)
  }
  routeQueue.replace({
    name: vm.$route.name,
    params: vm.$route.params,
    query: query,
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
  name: 'RespondentsSearch',
  mixins: [DocsLinkMixin(DocsFiles.respondents.search)],
  components: {
    RespondentItem,
    AddRespondentForm,
    RespondentChipList,
    TrellisModal,
    RespondentSearchFilters,
    ScrollContainer,
  },
  props: {
    searchQuery: {
      type: String,
      required: false,
      default: undefined,
    },
    canSelect: {
      type: Boolean,
      default: false,
    },
    limit: {
      type: Number,
      default: 0,
    },
    formsButtonVisible: {
      type: Boolean,
      default: true,
    },
    infoButtonVisible: {
      type: Boolean,
      default: true,
    },
    shouldUpdateRoute: {
      type: Boolean,
      default: true,
    },
    baseFilters: {
      type: Object,
      default: () => ({
        conditionTags: [],
        orConditionTags: [],
        geos: [],
        includeChildren: false,
        onlyCurrentGeo: true,
        randomize: true,
      }),
    },
    selectedRespondents: {
      type: Array,
      default: () => [],
    },
    respondentId: {
      type: String,
      required: false,
    },
    canAddRespondent: {
      type: Boolean,
      default: true,
    },
    canRemoveGeos: {
      type: Boolean,
      default: true,
    },
    onRespondentAdded: {
      type: Function,
      required: false,
    },
  },
  setup (props) {
    if (props.shouldUpdateRoute) {
      updateTitle('RespondentsSearch', { key: 'respondent_search' })
    }
  },
  data () {
    return {
      global: singleton,
      query: '',
      filters: Object.assign({
        conditionTags: [],
        orConditionTags: [],
        geos: [],
      }, this.baseFilters),
      added: [],
      removed: [],
      isLoading: false,
      showAssociatedRespondentDialog: false,
      filtersIsOpen: false,
      mode: 'all',
      panes: {
        all: this.newPane(),
        associated: this.newPane(),
      },
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
  },
  methods: {
    leaving () {
      PhotoService.cancelAllOutstanding()
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
      this.activePane.pagination.page = 0
      this.activePane.pagination.maxPages = 0
      // The other tab's cached results are now stale; refresh them next time it's opened
      this.invalidateOtherPanes()
      return this.getCurrentPage()
    },
    invalidateOtherPanes () {
      for (const key in this.panes) {
        if (key !== this.mode) {
          this.panes[key].loaded = false
        }
      }
    },
    newPane () {
      return {
        results: [],
        loaded: false,
        lastQuery: null,
        pagination: { page: 0, seed: null, size: 20, maxPages: 0, total: 0 },
      }
    },
    toggleAll () {
      let changing = []
      for (const r of this.respondentResults) {
        if (this.selected.findIndex((s) => s.id === r.id) === -1) {
          changing.push(r)
        }
      }
      if (!changing.length) {
        changing = this.selected
      }
      for (const r of changing) {
        this.onSelectRespondent(r)
      }
    },
    async updateCurrentPage (pageVal) {
      const pane = this.activePane
      pane.pagination.page = pageVal - 1
      await this.getCurrentPage()
      if (pane.results.length === pane.pagination.size && pane.pagination.page > pane.pagination.maxPages) {
        pane.pagination.maxPages = pane.pagination.page
      }
    },
    async getCurrentPage () {
      const study = this.global.study
      const pane = this.activePane
      this.isLoading = true
      PhotoService.cancelAllOutstanding()
      try {
        const page = this.mode === 'associated'
          ? await RespondentService.getAssociatedSearchPage(study.id, this.respondentId, this.query, pane.pagination)
          : await RespondentService.getSearchPage(study.id, this.query, this.filters, pane.pagination, this.respondentId)
        pane.pagination.seed = page.seed
        pane.results = page.data
        pane.pagination.total = page.total
        pane.loaded = true
        pane.lastQuery = this.query
      } catch (err) {
        if (this.isNotAuthError(err)) {
          this.logError(err)
        }
      } finally {
        this.isLoading = false
      }
    },
    onSelectRespondent (respondent) {
      this.$emit('selectRespondent', respondent)
      if (!this.canSelect) {
        return routeQueue.redirect({ name: 'Respondent', params: { respondentId: respondent.id, studyId: this.studyId } })
      }

      const sIndex = this.selected.findIndex((r) => r.id === respondent.id)
      const aIndex = this.added.findIndex((r) => r.id === respondent.id)
      const rIndex = this.removed.findIndex((r) => r.id === respondent.id)
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
        this.activePane.results.push(respondent)
      }
      // A newly added respondent may belong in the other tab too; refresh it on next open
      this.invalidateOtherPanes()
      this.showAssociatedRespondentDialog = false
    },
    getRespondentName (respondent) {
      const rName = respondent.names.find(n => n.isDisplayName)
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
    },
  },
  watch: {
    searchQuery (searchTerm) {
      if (searchTerm !== undefined) {
        this.query = searchTerm
      }
    },
    filters: {
      handler (newFilters, oldFilters) {
        this.search()
      },
      deep: true,
    },
    mode () {
      // Lazy-load the newly active tab the first time it's shown, or when the query changed while
      // it was inactive. Cached results are reused otherwise, so nothing runs until first switch.
      const pane = this.activePane
      if (!pane.loaded || pane.lastQuery !== this.query) {
        pane.pagination.page = 0
        pane.pagination.maxPages = 0
        this.getCurrentPage()
      }
    },
  },
  computed: {
    studyId () {
      return this.global.study.id
    },
    activePane () {
      return this.panes[this.mode]
    },
    pagination () {
      return this.activePane.pagination
    },
    showAssociatedOption () {
      return !!this.respondentId
    },
    selected () {
      const selected = this.selectedRespondents.concat(this.added)
      return selected.filter(r => r && this.removed.findIndex((removed) => removed.id === r.id) === -1)
    },
    respondentResults () {
      return orderBy(this.activePane.results, ['score'], ['desc'])
    },
    showLabels () {
      return this.filters.geos.length > 0
    },
    fullPageIsSelected () {
      for (const r of this.respondentResults) {
        if (this.selected.findIndex((s) => s.id === r.id) === -1) {
          return false
        }
      }
      return true
    },
    showPastResidents: {
      get () {
        return this.filters ? !this.filters.onlyCurrentGeo : false
      },
      set (val) {
        this.filters.onlyCurrentGeo = !val
      },
    },
    showGeoFilterOptions () {
      return this.filters && !!this.filters.geos.length
    },
  },
}
</script>
