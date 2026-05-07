<script setup lang="ts">
import { Ref, computed, ref } from 'vue'
import { debounce } from 'lodash'
import RespondentList from './RespondentList.vue'
import RespondentSearchFilters from './RespondentSearchFilters.vue'
import RespondentSearchPagination from './RespondentSearchPagination.vue'
import TrellisModal from '@/components/TrellisModal.vue'
import Respondent from '@/entities/trellis/Respondent'
import Geo from '@/entities/trellis/Geo'
import singleton from '@/static/singleton'
import { useRespondentSearch } from '@/helpers/respondent.helper'
import { SearchFilter } from '@/services/respondent/RespondentServiceInterface'
import type { RespondentListDisplay } from './RespondentList.vue'

/** Same union as `RespondentSearchFilters` geos prop. */
type GeoFilterEntry = Geo | string | { id: string }

type UIFilter = Omit<SearchFilter, 'geos'> & { geos?: GeoFilterEntry[] }

type Props = {
  value?: string | string[]
  multiple?: boolean
  initialFilters?: UIFilter
  studyId?: string
  label?: string
  /** Close the modal automatically after a single-select pick. Defaults to true. */
  closeOnSelect?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  value: undefined,
  multiple: false,
  initialFilters: () => ({
    conditionTags: [],
    orConditionTags: [],
    geos: [],
    includeChildren: false,
    onlyCurrentGeo: true,
    randomize: true,
  }),
  studyId: undefined,
  label: undefined,
  closeOnSelect: true,
})

type SelectorEmit = {
  (e: 'input', value: string | string[]): void;
  (e: 'update:modelValue', value: string | string[]): void;
}
const emit: SelectorEmit = defineEmits(['input', 'update:modelValue'])

const open = ref(false)

const query = ref('')
const filters = ref<UIFilter>({ ...props.initialFilters })
const pagination = ref({
  page: 0,
  seed: null as number | string | null,
  size: 20,
  total: 0,
})

const listDisplay = ref<RespondentListDisplay>('dense')

const studyId = computed(() => props.studyId || singleton.study.id)

const { results, loading } = useRespondentSearch({
  studyId,
  query,
  filters: filters as unknown as Ref<SearchFilter>,
  pagination,
})

const respondentResults = computed<Respondent[]>(() => results.value as Respondent[])

const selectedIds = computed<string[]>(() => {
  if (props.value == null) return []
  return Array.isArray(props.value) ? props.value : [props.value]
})

const selectedCount = computed(() => selectedIds.value.length)

function emitValue (next: string | string[]) {
  emit('input', next)
  emit('update:modelValue', next)
}

function onSelect (respondent: Respondent) {
  if (props.multiple) {
    const current = Array.isArray(props.value) ? props.value : []
    const idx = current.indexOf(respondent.id)
    const next = idx > -1
      ? [...current.slice(0, idx), ...current.slice(idx + 1)]
      : [...current, respondent.id]
    emitValue(next)
  } else {
    emitValue(respondent.id)
    if (props.closeOnSelect) {
      open.value = false
    }
  }
}

const onQueryInput = debounce((v: string) => {
  query.value = v || ''
  pagination.value.page = 0
}, 300)

function updatePage (pageVal: number) {
  pagination.value.page = pageVal - 1
}

function setListDisplay (v: RespondentListDisplay) {
  listDisplay.value = v
}

function onUpdateGeos (v: GeoFilterEntry[]) {
  filters.value.geos = v
}
</script>

<template>
  <v-btn @click="open = true">
    <span v-if="label">{{ label }}</span>
    <span v-else-if="props.multiple">
      {{ $t ? $t('select_respondents', { n: selectedCount }) : `Select respondents (${selectedCount})` }}
    </span>
    <span v-else>
      {{ $t ? $t('select_respondent') : 'Select respondent' }}
    </span>
    <TrellisModal
      :value="open"
      @input="open = $event"
      :title="$t ? $t('respondent_search') : 'Respondent search'"
    >
      <v-row class="no-gutters align-center flex-nowrap">
        <v-text-field
          :placeholder="$t ? $t('search') : 'Search'"
          :loading="loading"
          @input="onQueryInput"
          autocomplete="off"
          spellcheck="false"
          clearable
        />
        <RespondentSearchFilters
          :condition-tags="filters.conditionTags"
          @update:conditionTags="filters.conditionTags = $event"
          :include-children="filters.includeChildren"
          @update:includeChildren="filters.includeChildren = $event"
          :show-past-residents="!filters.onlyCurrentGeo"
          @update:showPastResidents="filters.onlyCurrentGeo = !$event"
          :geos="filters.geos ?? []"
          @update:geos="onUpdateGeos"
          :show-geo-filter-options="!!(filters.geos && filters.geos.length)"
          :list-display="listDisplay"
          @update:listDisplay="setListDisplay"
        />
      </v-row>

      <RespondentList
        :display="listDisplay"
        :respondents="respondentResults"
        :selected="selectedIds"
        :height="500"
        :forms-button-visible="false"
        :info-button-visible="false"
        @select="onSelect"
      />

      <RespondentSearchPagination
        :pagination="pagination"
        :loading="loading"
        :current-page-count="results.length"
        :show-total="true"
        @update:page="updatePage"
      />
    </TrellisModal>
  </v-btn>
</template>
