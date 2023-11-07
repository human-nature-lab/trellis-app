<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import AT from '@/static/action.types'
import RespondentService from '@/services/respondent'
import EdgeService from '@/services/edge'
import RespondentServiceInterface from '@/services/respondent/RespondentServiceInterface'
import Question from '@/entities/trellis/Question'
import { jsonQuestionParameter } from '@/lib/json-question-parameter'
import SocialRingDisplay, { PartialRespondent, Ring, SocialRingConfig } from './SocialRingDisplay.vue'
import Respondent from '@/entities/trellis/Respondent'
import { logError } from '@/helpers/log.helper'
import { useDataStore } from '@/helpers/interview.helper'
import { action } from '../../lib/action'
import { sharedInterviewInstance } from '../../classes/InterviewManager'
import PhotoService from '@/services/photo'

const rs: RespondentServiceInterface = RespondentService
const props = defineProps<{
  question: Question
  respondent: Respondent
  location: object
}>()

const { config, loading: loadingConfig, error } = jsonQuestionParameter<SocialRingConfig>(props.question)
const loadingRespondents = ref(true)
const respondents = ref<Respondent[]>([])
const srcs = new Map<string, string>()

watch(config, async () => {
  if (!config.value) return
  if (!sharedInterviewInstance || !sharedInterviewInstance.data) {
    throw new Error('Data store not initialized. Make sure it is initialized before using this component')
  }
  const dataStore = sharedInterviewInstance.data
  try {
    const qds = dataStore.getQuestionDataByQuestionId(config.value.sourceQuestionId)
    if (qds.length !== 1) {
      throw new Error('Unable to get data from source question')
    }
    const data = qds[0].data
    const edgeIds = data.map(d => d.edgeId)
    console.log('source data', data, edgeIds)
    const edges = await EdgeService.getEdges(edgeIds)
    console.log('edges', edges)
    const respondentIds = edges.map(e => e.targetRespondentId)
    console.log('respondentIds', respondentIds)
    respondents.value = await rs.getRespondentsByIds(respondentIds)
    const respondentSrcs = await Promise.all(respondents.value.map(async respondent => {
      const [p, cancel] = PhotoService.getPhotoSrc(respondent.photos[0].id)
      const src = await p
      return [respondent.id, src] as [string, string]
    }))
    srcs.clear()
    for (const [id, src] of respondentSrcs) {
      srcs.set(id, src)
    }
  } catch (err) {
    logError(err)
  } finally {
    loadingRespondents.value = false
  }
}, { immediate: true })

const loading = computed(() => loadingConfig.value || loadingRespondents.value)

const ringMap = computed<Record<string, string|number>>(() => {
  const map = {}
  for (const d of props.question.datum.data) {
    if (d.name === 'ring') {
      const parts = d.val.split('->')
      map[parts[0]] = parts[1]
    }
  }
  return map
})

function respondentToPartialRespondent (respondent: Respondent): PartialRespondent {
  return {
    id: respondent.id,
    name: respondent.name,
    avatarSrc: srcs.get(respondent.id),
  }
}

const ringRespondents = computed<PartialRespondent[]>(() => {
  return respondents.value.map(respondent => {
    return respondentToPartialRespondent(respondent)
  })
})

const ego = computed<PartialRespondent>(() => {
  return respondentToPartialRespondent(props.respondent)
})
function onRingChange (respondentId: string, ring: Ring) {
  action(props.question.id, AT.add_val, {
    name: 'ring',
    val: `${respondentId}->${ring.varName}`,
  })
}
</script>

<template>
  <v-col>
    <v-progress-linear
      v-if="loading"
      indeterminate
    />
    <v-col v-else>
      <!-- {{ ringMap }} -->
      <SocialRingDisplay
        :value="ringMap"
        @change-ring="onRingChange"
        :respondents="ringRespondents"
        :ego="ego"
        hide-after-move
        :config="config"
      />
    </v-col>
  </v-col>
</template>

<style lang="sass">

</style>
