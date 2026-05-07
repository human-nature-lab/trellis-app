<template>
  <v-container
    fluid
    class="respondent-search d-flex flex-column fill-height pa-0"
  >
    <div class="respondent-search__header pa-2">
      <v-row class="no-gutters align-center flex-nowrap">
        <v-text-field
          v-model="query"
          :placeholder="$t('search')"
          :loading="isLoading"
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
          :list-display="listDisplay"
          @update:listDisplay="listDisplay = $event"
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
    </div>

    <RespondentList
      class="flex-grow-1"
      :display="listDisplay"
      :respondents="respondentResults"
      :selected="selected"
      :height="listHeight"
      :forms-button-visible="formsButtonVisible"
      :info-button-visible="infoButtonVisible"
      :get-labels="getRespondentLabels"
      @select="onSelectRespondent"
    />

    <RespondentSearchPagination
      :pagination="pagination"
      :loading="isLoading"
      :current-page-count="respondentResults.length"
      @update:page="updateCurrentPage"
    >
      <template
        v-if="canAddRespondent"
        #actions
      >
        <v-btn
          color="primary"
          @click="showAssociatedRespondentDialog = true"
          :disabled="isLoading"
        >
          <span v-if="respondentId">{{ $t("add_other_respondent") }}</span>
          <span v-else>{{ $t("add_respondent") }}</span>
        </v-btn>
      </template>
    </RespondentSearchPagination>

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
import { merge, orderBy } from 'lodash'
import { ref, computed, getCurrentInstance } from 'vue'
import AddRespondentForm from '@/components/respondent/AddRespondentForm.vue'
import RespondentSearchFilters from '@/components/respondent/RespondentSearchFilters.vue'
import RespondentChipList from '@/components/respondent/RespondentChipList.vue'
import RespondentList from '@/components/respondent/RespondentList.vue'
import RespondentSearchPagination from '@/components/respondent/RespondentSearchPagination.vue'
import { routeQueue } from '@/router'
import TranslationService from '@/services/TranslationService'
import singleton from '@/static/singleton'
import PhotoService from '@/services/photo'
import DocsLinkMixin from '@/mixins/DocsLinkMixin'
import DocsFiles from '@/components/documentation/DocsFiles'
import TrellisModal from '@/components/TrellisModal.vue'
import { updateTitle } from '@/router/history'
import { useRespondentSearch } from '@/helpers/respondent.helper'

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

function applyRouteToRefs (route, query, filters) {
  if (route.query.query) {
    query.value = route.query.query
  }
  if (route.query.filters) {
    merge(filters.value, JSON.parse(route.query.filters))
  }
}

export default {
  name: 'RespondentsSearch',
  mixins: [DocsLinkMixin(DocsFiles.respondents.search)],
  components: {
    AddRespondentForm,
    RespondentChipList,
    RespondentList,
    RespondentSearchFilters,
    RespondentSearchPagination,
    TrellisModal,
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

    const query = ref('')
    const filters = ref(Object.assign({
      conditionTags: [],
      orConditionTags: [],
      geos: [],
    }, props.baseFilters))
    const pagination = ref({
      page: 0,
      seed: null,
      size: 20,
      maxPages: 0,
      total: 0,
    })

    // Seed query/filters from the URL or props before kicking off the
    // composable so the first load uses the correct inputs.
    const inst = getCurrentInstance()
    if (props.shouldUpdateRoute && inst) {
      applyRouteToRefs(inst.proxy.$route, query, filters)
    }
    if (props.searchQuery !== undefined) {
      query.value = props.searchQuery
    }

    const studyId = computed(() => singleton.study.id)
    const respondentIdRef = computed(() => props.respondentId)

    const search = useRespondentSearch({
      studyId,
      query,
      filters,
      pagination,
      respondentId: respondentIdRef,
    })

    return {
      query,
      filters,
      pagination,
      results: search.results,
      isLoading: search.loading,
      reload: search.reload,
    }
  },
  data () {
    return {
      global: singleton,
      added: [],
      removed: [],
      showAssociatedRespondentDialog: false,
      filtersIsOpen: false,
      listHeight: 600,
      listDisplay: 'cards',
    }
  },
  created () {
    if (this.shouldUpdateRoute && this.filters.conditionTags && this.filters.conditionTags.length) {
      this.filtersIsOpen = true
    }
  },
  mounted () {
    this.recomputeListHeight()
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', this.recomputeListHeight, { passive: true })
    }
  },
  beforeDestroy () {
    if (typeof window !== 'undefined') {
      window.removeEventListener('resize', this.recomputeListHeight)
    }
  },
  methods: {
    leaving () {
      PhotoService.cancelAllOutstanding()
    },
    translate (translation) {
      return TranslationService.getAny(translation, this.global.locale.id)
    },
    recomputeListHeight () {
      if (typeof window === 'undefined') return
      const headerEl = this.$el && this.$el.querySelector
        ? this.$el.querySelector('.respondent-search__header')
        : null
      const headerHeight = headerEl ? headerEl.offsetHeight : 0
      const paginationOffset = 160
      const next = window.innerHeight - headerHeight - paginationOffset
      this.listHeight = Math.max(240, next)
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
    updateCurrentPage (pageVal) {
      const nextPage = pageVal - 1
      this.pagination.page = nextPage
      if (this.results.length === this.pagination.size && nextPage > this.pagination.maxPages) {
        this.pagination.maxPages = nextPage
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
      if (respondent && !this.query) {
        this.results.push(respondent)
      }
      this.showAssociatedRespondentDialog = false
    },
    getRespondentLabels (_respondent) {
      if (!this.showLabels) return []
      return []
    },
  },
  watch: {
    searchQuery (searchTerm) {
      if (searchTerm !== undefined) {
        this.query = searchTerm
      }
    },
    query () {
      if (this.shouldUpdateRoute) {
        updateRoute(this)
      }
      this.pagination.page = 0
      this.pagination.maxPages = 0
    },
    filters: {
      handler () {
        if (this.shouldUpdateRoute) {
          updateRoute(this)
        }
        this.pagination.page = 0
        this.pagination.maxPages = 0
      },
      deep: true,
    },
  },
  computed: {
    studyId () {
      return this.global.study.id
    },
    selected () {
      const selected = this.selectedRespondents.concat(this.added)
      return selected.filter(r => r && this.removed.findIndex((removed) => removed.id === r.id) === -1)
    },
    respondentResults () {
      return orderBy(this.results, ['score'], ['desc'])
    },
    showLabels () {
      return this.filters && this.filters.geos && this.filters.geos.length > 0
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
      return this.filters && !!(this.filters.geos && this.filters.geos.length)
    },
  },
}
</script>

<style lang="sass" scoped>
.respondent-search
  width: 100%
  &__header
    flex: 0 0 auto
    width: 100%
</style>
