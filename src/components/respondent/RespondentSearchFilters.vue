<script setup lang="ts">
import { computed, ref } from 'vue'
import ConditionTagAutocomplete from '../ConditionTagAutocomplete.vue'
import TrellisModal from '../TrellisModal.vue'
import { dirtyRef } from '@/hooks/dirtyRef'
import Geo from '@/entities/trellis/Geo'
import GeoBreadcrumbs from '@/components/geo/GeoBreadcrumbs.vue'
import type { RespondentListDisplay } from './RespondentList.vue'
import SingleButtonToggle from '../util/SingleButtonToggle.vue'

/** Geo entity, id string, or plain `{ id }` from serialized filters. */
type GeoFilterEntry = Geo | string | { id: string }

const props = withDefaults(defineProps<{
  conditionTags?: string[]
  geos?: GeoFilterEntry[]
  includeChildren?: boolean
  showGeoFilterOptions?: boolean
  showPastResidents?: boolean
  canRemoveGeos?: boolean
  /** Display mode for `RespondentList`: cards, list, or dense rows. */
  listDisplay?: RespondentListDisplay
}>(), {
  listDisplay: 'list',
})

type FiltersEmit = {
  (e: 'update:conditionTags', value: string[]): void
  (e: 'update:includeChildren', value: boolean): void
  (e: 'update:showPastResidents', value: boolean): void
  (e: 'update:geos', value: GeoFilterEntry[]): void
  (e: 'update:listDisplay', value: RespondentListDisplay): void
}
const emit: FiltersEmit = defineEmits([
  'update:conditionTags',
  'update:includeChildren',
  'update:showPastResidents',
  'update:geos',
  'update:listDisplay',
])

function onListDisplayChange (v: RespondentListDisplay) {
  emit('update:listDisplay', v)
}

function geoEntryId (entry: GeoFilterEntry): string {
  return typeof entry === 'string' ? entry : entry.id
}

const isOpen = ref(false)
const conditionTags = dirtyRef(() => props.conditionTags, [])
const includeChildren = dirtyRef(() => props.includeChildren, false)
const showPastResidents = dirtyRef(() => props.showPastResidents, false)
const geos = dirtyRef(() => (props.geos || []).slice(), [])

function onConditionTagsInput (value: string[]) {
  conditionTags.value = value
}

function removeGeoFilter (index: number) {
  geos.value.splice(index, 1)
}

function save () {
  if (conditionTags.isDirty) {
    emit('update:conditionTags', conditionTags.value)
  }
  if (includeChildren.isDirty) {
    emit('update:includeChildren', includeChildren.value)
  }
  if (showPastResidents.isDirty) {
    emit('update:showPastResidents', showPastResidents.value)
  }
  if (geos.isDirty) {
    emit('update:geos', geos.value)
  }
  isOpen.value = false
}

function cancel () {
  isOpen.value = false
  conditionTags.reset()
  includeChildren.reset()
  showPastResidents.reset()
  geos.reset()
}

const numAppliedFilters = computed(() => {
  return conditionTags.value.length + (geos.value ? geos.value.length : 0)
})

const hasChanged = computed(() => {
  return conditionTags.isDirty || includeChildren.isDirty || showPastResidents.isDirty || geos.isDirty
})
</script>

<template>
  <div class="respondent-search-filters d-flex align-center flex-shrink-0 ml-2">
    <v-btn
      icon
      @click="isOpen = true"
    >
      <v-badge
        :value="!!numAppliedFilters"
        :content="numAppliedFilters"
        color="accent"
      >
        <v-icon>
          mdi-filter-variant
        </v-icon>
      </v-badge>
    </v-btn>

    <SingleButtonToggle
      icon
      class="ml-2"
      :value="props.listDisplay"
      @input="onListDisplayChange"
      :options="[
        { icon: 'mdi-view-grid', value: 'cards' },
        { icon: 'mdi-view-list', value: 'list' },
        { icon: 'mdi-format-list-bulleted', value: 'dense' },
      ]"
    />

    <TrellisModal
      :value="isOpen"
      @close="cancel"
      max-width="800"
      :title="$t('filter_respondents')"
    >
      <v-col
        v-if="isOpen"
        class="px-0"
      >
        <ConditionTagAutocomplete
          :value="conditionTags"
          @input="onConditionTagsInput"
        />
      </v-col>
      <v-col
        v-if="geos && geos.length"
        class="align-center pa-0 mb-2"
      >
        <v-col class="subheading pa-0 mb-2">
          {{ $t("locations") }}
        </v-col>
        <v-row class="no-gutters">
          <v-chip
            v-for="(geo, index) in geos"
            :key="geoEntryId(geo)"
            color="primary"
            outlined
            @click:close="removeGeoFilter(index)"
            :close="props.canRemoveGeos"
          >
            <v-avatar>
              <v-icon>mdi-home</v-icon>
            </v-avatar>
            <GeoBreadcrumbs
              :geo-id="geoEntryId(geo)"
              :max-depth="2"
            />
          </v-chip>
        </v-row>
      </v-col>
      <v-divider v-if="showGeoFilterOptions" />
      <v-row
        v-if="props.showGeoFilterOptions"
        class="no-gutters"
      >
        <v-col>
          <v-switch
            v-model="includeChildren"
            :label="$t('include_child_locations')"
          />
        </v-col>
        <v-col>
          <v-switch
            v-model="showPastResidents"
            :label="$t('show_past_residents')"
          />
        </v-col>
      </v-row>
      <v-row class="no-gutters mt-4">
        <v-spacer />
        <v-btn
          @click="cancel"
          text
        >
          {{ $t('cancel') }}
        </v-btn>
        <v-btn
          @click="save"
          color="success"
          :disabled="!hasChanged"
        >
          {{ $t('apply') }}
        </v-btn>
      </v-row>
    </TrellisModal>
  </div>
</template>

<style lang="sass">
.respondent-search-filters__layout
  flex-shrink: 0
</style>
