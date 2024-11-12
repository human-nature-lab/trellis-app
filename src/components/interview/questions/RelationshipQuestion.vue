<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router/composables'
import { uniq } from 'lodash'
import ActionTypes from '@/static/action.types'
import RespondentsSearch from '@/views/respondent/RespondentsSearch.vue'
import EdgeService from '@/services/edge'
import parameterTypes from '@/static/parameter.types'
import GeoService from '@/services/geo'
import TrellisModal from '@/components/TrellisModal.vue'
import Respondent from '@/entities/trellis/Respondent'
import Question from '@/entities/trellis/Question'
import { logError } from '@/helpers/log.helper'
import { action } from '../lib/action'
import { useQuestionDisabled } from '@/helpers/interview.helper'
import { InterviewLocation } from '../services/InterviewAlligator'
import Edge from '@/entities/trellis/Edge'
import RespondentEdgeList from '@/components/respondent/RespondentEdgeList.vue'

const props = defineProps<{
  respondent: Respondent,
  question: Question,
  location: InterviewLocation
  disabled?: boolean
}>()

const $router = useRouter()
const isLoading = ref(false)
const route = useRoute()
const isRespondentSearchVisible = ref(false)
const loadedEdges = ref<Record<string, Edge>>({})
const error = ref<Error>(null)
const isSavingEdges = ref(false)
const baseAncestorIds = ref<string[]>([])
const searchQuery = ref(undefined)

async function loadEdges (edgeIds: string[]) {
  if (!edgeIds.length) return
  try {
    const edges = await EdgeService.getEdges(edgeIds)
    for (const edge of edges) {
      loadedEdges.value[edge.id] = edge
    }
    loadedEdges.value = { ...loadedEdges.value }
  } catch (err) {
    logError(err)
    error.value = err
  }
}

const isQuestionDisabled = useQuestionDisabled(props)

const canAddRespondent = computed(() => {
  const hasFalseParam = props.question.questionParameters.findIndex(p => {
    return p.parameter.name === 'can_add_respondent' && parseInt(p.val, 10) === 0
  }) > -1
  return !hasFalseParam
})

const showNoOne = computed(() => {
  const hideNoOneIndex = props.question.questionParameters.findIndex(p => {
    return parseInt(p.parameterId, 10) === parameterTypes.hide_no_one && !!+p.val
  })
  return hideNoOneIndex === -1
})

const geoTypeParameterValue = computed(() => {
  const geoTypeParameter = props.question.questionParameters.find(p => parseInt(p.parameterId, 10) === parameterTypes.geo_type)
  return geoTypeParameter ? geoTypeParameter.val : null
})

const orConditionTagParameterValues = computed(() => {
  const orConditionTagParameters = props.question.questionParameters.filter(p => parseInt(p.parameterId, 10) === parameterTypes.or_respondent_condition_tag)
  return orConditionTagParameters.map(ctp => ctp.val)
})

const andConditionTagParameterValues = computed(() => {
  const andConditionTagParameters = props.question.questionParameters.filter(p => parseInt(p.parameterId, 10) === parameterTypes.and_respondent_condition_tag)
  return andConditionTagParameters.map(ctp => ctp.val)
})

const baseRespondentFilters = computed(() => {
  const filters = {
    includeChildren: true,
    onlyCurrentGeo: false,
    randomize: true,
  }
  if (geoTypeParameterValue.value && baseAncestorIds.value.length) {
    filters.geos = baseAncestorIds.value.slice()
  }
  if (andConditionTagParameterValues.value.length > 0) {
    filters.conditionTags = andConditionTagParameterValues.value
  }
  if (orConditionTagParameterValues.value.length > 0) {
    filters.orConditionTags = orConditionTagParameterValues.value
  }
  return filters
})

const edgeIds = computed(() => {
  return props.question.datum.data.map(d => d.edgeId)
})

function respondentName (r: Respondent): string {
  for (const name of r.names) {
    if (name.isDisplayName) {
      return name.name
    }
  }
  return r.name
}

const edges = computed(() => {
  const toLoad = []
  const edges = edgeIds.value.map(id => {
    if (loadedEdges.value[id]) {
      return loadedEdges.value[id]
    } else {
      toLoad.push(id)
      return { id: id, isLoading: true }
    }
  })
  loadEdges(toLoad)
  return edges.sort((a, b) => {
    const edgeA = loadedEdges.value[a.id]
    const edgeB = loadedEdges.value[b.id]
    if (!edgeA || !edgeB || !edgeA.targetRespondent || !edgeB.targetRespondent) {
      return 0
    }
    return respondentName(edgeA.targetRespondent).localeCompare(respondentName(edgeB.targetRespondent))
  })
})

const selectedRespondents = computed(() => {
  return edges.value.map(edge => {
    return edge.targetRespondent
  })
})

const selectLimit = computed(() => {
  for (const p of props.question.questionParameters) {
    if (p.parameter.name === 'max_relationships') {
      return parseInt(p.val, 10)
    }
  }
  return 0
})

const isNoOneSelected = computed(() => {
  return props.question.datum && props.question.datum.noOne
})

const hasAddedRelationships = computed(() => {
  return props.question.datum && props.question.datum.data.length > 0
})

async function showRespondentSearch () {
  if (geoTypeParameterValue.value && !baseAncestorIds.value.length && props.respondent.geos.length) {
    const p = []
    const geoTypeCompareVal = geoTypeParameterValue.value.replace(/\s/g, '').toLowerCase()
    for (const rGeo of props.respondent.geos) {
      // Restrict respondent geos to current geos
      if (rGeo.isCurrent) {
        isLoading.value = true
        p.push(GeoService.getGeoAncestors(rGeo.geoId).then(ancestors => {
          const baseAncestor = ancestors.find(a => a.geoType.name.replace(/\s/g, '').toLowerCase() === geoTypeCompareVal)
          if (!baseAncestor) console.warn('Unable to find respondent ancestor matching', geoTypeParameterValue.value)
          if (baseAncestor) {
            baseAncestorIds.value.push(baseAncestor.id)
          }
        }))
      }
    }
    await Promise.all(p)
    isLoading.value = false
  }
  baseAncestorIds.value = uniq(baseAncestorIds.value.slice())
  isRespondentSearchVisible.value = true
}

function add (edgeId) {
  action(props.question.id, ActionTypes.add_edge, {
    name: props.question.varName,
    val: edgeId,
    edge_id: edgeId,
  })
}

function remove (edgeId) {
  action(props.question.id, ActionTypes.remove_edge, {
    edge_id: edgeId,
  })
}

function updateNoOne () {
  if (isNoOneSelected.value) {
    action(props.question.id, ActionTypes.deselect_no_one)
  } else {
    action(props.question.id, ActionTypes.select_no_one)
  }
}

async function onRespondentAdded (respondent) {
  const edges = await EdgeService.createEdges([{
    source_respondent_id: props.respondent.id,
    target_respondent_id: respondent.id,
  }])
  add(edges[0].id)
}

async function onSelected (added, removed) {
  isSavingEdges.value = true
  const edgeBlueprints = added.map(id => ({
    source_respondent_id: props.respondent.id,
    target_respondent_id: id,
  }))
  try {
    const newEdges = await EdgeService.createEdges(edgeBlueprints)
    for (const edge of newEdges) {
      loadedEdges.value[edge.id] = edge
    }
    for (const edge of newEdges) {
      add(edge.id)
    }
    for (const respondentId of removed) {
      const edge = edges.value.find(edge => edge.targetRespondentId === respondentId)
      remove(edge.id)
    }
  } catch (err) {
    logError(err)
    error.value = err
  } finally {
    isSavingEdges.value = false
    isRespondentSearchVisible.value = false
  }
}

function handleAssociatedRespondentQuery () {
  if (route && route.query && route.query.associatedRespondentId) {
    searchQuery.value = route.query.associatedRespondentName
    // Remove the associatedRespondentId from the queryString
    const query = Object.assign({}, route.query)
    delete query.associatedRespondentId
    delete query.associatedRespondentName
    $router.replace({ query })
  }
}

onMounted(() => {
  loadEdges(edgeIds.value)
  handleAssociatedRespondentQuery()
})

const isDisabled = computed(() => {
  return props.disabled || isQuestionDisabled.value
})
</script>

<template>
  <v-col class="relationship">
    <div
      class="error"
      v-if="error"
    >
      {{ error }}
    </div>
    <v-progress-linear
      v-if="isLoading"
      indeterminate
    />
    <RespondentEdgeList
      :value="edges"
      :current-respondent-id="props.respondent.id"
      @remove="edge => remove(edge.id)"
      :editable="true"
      :disabled="isDisabled || isNoOneSelected"
    />
    <v-row class="no-gutters my-2">
      <v-btn
        :disabled="isQuestionDisabled || isNoOneSelected"
        @click="showRespondentSearch()"
      >
        {{ $t('add_relationship') }}
      </v-btn>
      <v-btn
        v-if="showNoOne"
        :disabled="isQuestionDisabled || hasAddedRelationships"
        :class="{ primary: isNoOneSelected }"
        @click="updateNoOne()"
      >
        {{ $t('no_one') }}
      </v-btn>
    </v-row>
    <TrellisModal
      v-model="isRespondentSearchVisible"
      :title="$t('respondent_search')"
      :fullscreen="$vuetify.breakpoint.smAndDown"
    >
      <RespondentsSearch
        :can-select="true"
        :limit="selectLimit"
        :should-update-route="false"
        :can-add-respondent="canAddRespondent"
        @selected="onSelected"
        :on-respondent-added="onRespondentAdded"
        :respondent-id="respondent.id"
        :forms-button-visible="false"
        :base-filters="baseRespondentFilters"
        :selected-respondents="selectedRespondents"
        :can-remove-geos="false"
        :search-query="searchQuery"
        :is-loading="isSavingEdges"
      />
    </TrellisModal>
  </v-col>
</template>

<style lang="sass" scoped>
.avatar
  overflow: hidden
.btn
  &.active
    background: orangered
    color: white
</style>
