<!--
  Renders respondents in three display modes:
    - 'cards': RespondentItem grid (v-flex xs6/sm6/md4/lg3/xl2), matching legacy search.
    - 'list': rows with photo and name
    - 'dense': compact one-line rows

  Pagination keeps pages small; scroll inside max-height when needed.
-->
<script lang="ts" setup>
import { computed } from 'vue'
import Respondent from '@/entities/trellis/Respondent'
import RespondentItem from './RespondentItem.vue'
import ConditionTagDot from './ConditionTagDot.vue'
import Photo from '../photo/Photo.vue'

export type RespondentListDisplay = 'cards' | 'list' | 'dense'
export type LabelGetter = (r: Respondent) => string[]

interface Props {
  respondents: Respondent[]
  display?: RespondentListDisplay
  selected?: Respondent[] | string[]
  /** Max height for the scrollable area (number = px). */
  height?: number | string
  formsButtonVisible?: boolean
  infoButtonVisible?: boolean
  getLabels?: LabelGetter
}

const props = withDefaults(defineProps<Props>(), {
  display: 'list',
  selected: () => [],
  height: 600,
  formsButtonVisible: true,
  infoButtonVisible: true,
  getLabels: undefined,
})

const emit = defineEmits(['select'])

const selectedIds = computed(() => {
  const set = new Set<string>()
  for (const s of props.selected) {
    set.add(typeof s === 'string' ? s : s.id)
  }
  return set
})

function isSelected (r: Respondent): boolean {
  return selectedIds.value.has(r.id)
}

function getName (r: Respondent): string {
  const noName = 'Unnamed Respondent'
  if (!r) return noName
  if (r.names && r.names.length) {
    const display = r.names.find(n => n.isDisplayName)
    return display ? display.name : (r.name || noName)
  }
  return r.name || noName
}

function getPhoto (r: Respondent) {
  return r && r.photos && r.photos.length ? r.photos[0] : null
}

const scrollStyle = computed(() => {
  const h = props.height
  if (h === undefined || h === '') return {}
  const px = typeof h === 'number' ? `${h}px` : String(h)
  return {
    maxHeight: px,
    overflowY: 'auto' as const,
  }
})

function onSelect (r: Respondent) {
  emit('select', r)
}
</script>

<template>
  <div
    v-if="!respondents || !respondents.length"
    class="respondent-list-empty pa-4 text-center grey--text"
  >
    <v-icon
      large
      color="grey lighten-1"
      class="mb-2"
    >
      mdi-account-off
    </v-icon>
    <div>{{ $t ? $t('no_results') : 'No respondents' }}</div>
  </div>

  <div
    v-else-if="display === 'cards'"
    class="respondent-list respondent-list--cards respondent-list__scroll"
    :style="scrollStyle"
  >
    <v-row
      no-gutters
      class="respondent-list__card-grid"
    >
      <RespondentItem
        v-for="r in respondents"
        :key="r.id"
        :respondent="r"
        :selected="isSelected(r)"
        :forms-button-visible="formsButtonVisible"
        :info-button-visible="infoButtonVisible"
        :labels="getLabels ? getLabels(r) : []"
        @selected="onSelect(r)"
      />
    </v-row>
  </div>

  <v-list
    v-else
    class="respondent-list respondent-list__scroll pa-0"
    :class="`respondent-list--${display}`"
    :dense="display === 'dense'"
    :style="scrollStyle"
  >
    <v-list-item
      v-for="r in respondents"
      :key="r.id"
      :class="{ 'respondent-list__row': true, 'respondent-list__row--selected': isSelected(r) }"
      :dense="display === 'dense'"
      @click="onSelect(r)"
    >
      <v-list-item-avatar
        v-if="display === 'list'"
        tile
        size="64"
        class="respondent-list__avatar"
      >
        <Photo
          v-if="getPhoto(r)"
          :photo="getPhoto(r)"
        />
        <v-icon v-else>
          mdi-account
        </v-icon>
      </v-list-item-avatar>
      <v-list-item-icon
        v-else-if="display === 'dense'"
        class="my-2 mr-3"
      >
        <v-icon small>
          mdi-account
        </v-icon>
      </v-list-item-icon>

      <v-list-item-content>
        <v-list-item-title class="d-flex align-center">
          <span class="text-truncate">{{ getName(r) }}</span>
          <ConditionTagDot
            v-for="tag in r.respondentConditionTags || []"
            :key="tag.id"
            :name="tag.conditionTag && tag.conditionTag.name"
            class="ml-1"
          />
        </v-list-item-title>
        <v-list-item-subtitle
          v-if="display === 'list'"
        >
          <span v-if="r.assignedId">{{ r.assignedId }}</span>
          <span
            v-if="getLabels"
            class="ml-2"
          >
            <v-chip
              v-for="label in getLabels(r)"
              :key="label"
              x-small
              outlined
              label
              class="mr-1"
            >{{ label }}</v-chip>
          </span>
        </v-list-item-subtitle>
      </v-list-item-content>

      <v-list-item-action v-if="display === 'list'">
        <v-icon>mdi-chevron-right</v-icon>
      </v-list-item-action>
    </v-list-item>
  </v-list>
</template>

<style lang="sass" scoped>
.respondent-list
  width: 100%

.respondent-list__scroll
  width: 100%

.respondent-list__card-grid
  width: 100%

.respondent-list__row
  border-bottom: 1px solid rgba(0, 0, 0, 0.06)
  cursor: pointer
  &--selected
    background-color: rgba(255, 69, 0, 0.12)

.respondent-list__avatar
  border-radius: 4px
  overflow: hidden

.respondent-list-empty
  width: 100%
</style>
