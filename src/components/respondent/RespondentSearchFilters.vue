<script setup lang="ts">
import { computed, ref } from 'vue'
import ConditionTagAutocomplete from '../ConditionTagAutocomplete.vue'
import TrellisModal from '../TrellisModal.vue'
import { dirtyRef } from '@/hooks/dirtyRef'
import Geo from '@/entities/trellis/Geo'
import GeoBreadcrumbs from '@/components/geo/GeoBreadcrumbs.vue'

const props = defineProps<{
  conditionTags?: string[]
  geos?: Geo[]
  includeChildren?: boolean
  showGeoFilterOptions?: boolean
  showPastResidents?: boolean
  canRemoveGeos?: boolean
  associatedOnly?: boolean
  showAssociatedOption?: boolean
}>()

const emit = defineEmits<{
  (event: 'update:conditionTags', value: string[]): void
  (event: 'update:includeChildren', value: boolean): void
  (event: 'update:showPastResidents', value: boolean): void
  (event: 'update:geos', value: Geo[]): void
  (event: 'update:associatedOnly', value: boolean): void
}>()

const isOpen = ref(false)
const conditionTags = dirtyRef(() => props.conditionTags, [])
const includeChildren = dirtyRef(() => props.includeChildren, false)
const showPastResidents = dirtyRef(() => props.showPastResidents, false)
const geos = dirtyRef(() => props.geos.slice(), [])
const associatedOnly = dirtyRef(() => props.associatedOnly, false)

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
  if (associatedOnly.isDirty) {
    emit('update:associatedOnly', associatedOnly.value)
  }
  isOpen.value = false
}

function cancel () {
  isOpen.value = false
  conditionTags.reset()
  includeChildren.reset()
  showPastResidents.reset()
  geos.reset()
  associatedOnly.reset()
}

const numAppliedFilters = computed(() => {
  // When showing associated only, the geo/tag filters don't apply, so surface it as the one filter
  if (associatedOnly.value) {
    return 1
  }
  return conditionTags.value.length + (geos.value ? geos.value.length : 0)
})

const hasChanged = computed(() => {
  return conditionTags.isDirty || includeChildren.isDirty || showPastResidents.isDirty || geos.isDirty || associatedOnly.isDirty
})
</script>

<template>
  <v-btn
    icon
    @click="isOpen = true"
    class="ml-2"
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

    <TrellisModal
      :value="isOpen"
      @close="cancel"
      max-width="800"
      :title="$t('filter_respondents')"
    >
      <template v-if="showAssociatedOption">
        <v-switch
          v-model="associatedOnly"
          :label="$t('associated_only')"
          hide-details="auto"
          class="mt-0 mb-2"
        />
        <v-divider class="mb-2" />
      </template>
      <div :class="{ 'filters-disabled': associatedOnly }">
        <v-col
          v-if="isOpen"
          class="px-0"
        >
          <ConditionTagAutocomplete v-model="conditionTags" />
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
              :key="geo.id"
              color="primary"
              outlined
              @click:close="removeGeoFilter(index)"
              :close="props.canRemoveGeos"
            >
              <v-avatar>
                <v-icon>mdi-home</v-icon>
              </v-avatar>
              <GeoBreadcrumbs
                :geo-id="geo"
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
      </div>
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
  </v-btn>
</template>

<style lang="sass">
.filters-disabled
  opacity: 0.5
  pointer-events: none
</style>
