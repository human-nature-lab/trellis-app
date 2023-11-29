<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import SocialRingDisplay, { PartialRespondent, Ring, SocialRingConfig } from './SocialRingDisplay.vue'
import Translated from '@/components/translation/Translated.vue'
import AT from '@/static/action.types'
import RespondentService from '@/services/respondent'
import EdgeService from '@/services/edge'
import RespondentServiceInterface from '@/services/respondent/RespondentServiceInterface'
import Question from '@/entities/trellis/Question'
import { jsonQuestionParameter } from '@/lib/json-question-parameter'
import Respondent from '@/entities/trellis/Respondent'
import { logError } from '@/helpers/log.helper'
import { action } from '../../lib/action'
import URL_PLACEHOLDER from '@/assets/baseline-image-24px.svg'
import { sharedInterviewInstance } from '../../classes/InterviewManager'
import PhotoService from '@/services/photo'
import global from '@/static/singleton'

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

    // Ensure consistent random sort order
    data.sort((a, b) => a.randomSortOrder - b.randomSortOrder)
    const edgeIds = data.map(d => d.edgeId)
    const edges = await EdgeService.getEdges(edgeIds)
    const respondentIds = edges.map(e => e.targetRespondentId)
    const res = await rs.getRespondentsByIds(respondentIds.concat(props.respondent.id))
    respondents.value = res.filter(r => r.id !== props.respondent.id)

    const respondentSrcs = await Promise.all(res.map(async respondent => {
      if (!respondent.photos || !respondent.photos.length) {
        return [respondent.id, URL_PLACEHOLDER]
      }
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
  const data = props.question.datum.data.slice()
  data.sort((a, b) => a.sortOrder - b.sortOrder)
  for (const d of data) {
    if (d.name === 'ring') {
      const parts = JSON.parse(d.val)
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
function onRingChange (respondentId: string, ring: Ring, duringReview: boolean) {
  action(props.question.id, AT.add_val, {
    name: 'ring',
    val: JSON.stringify([respondentId, ring.varName, duringReview ? 'review' : 'initial']),
  })
}
</script>

<template>
  <v-col class="pa-0 ma-0">
    <v-progress-linear
      v-if="loading"
      indeterminate
    />
    <v-col
      v-else
      class="pa-0 ma-0"
    >
      <v-list
        v-if="config.showRingText"
        dense
      >
        <v-list-item
          v-for="ring in config.rings"
          :key="ring.varName"
          dense
        >
          <span class="mr-4">{{ ring.varName }})</span>
          <Translated
            v-if="ring.labelTranslationId"
            :translation-id="ring.labelTranslationId"
            :locale="global.locale"
          />
        </v-list-item>
      </v-list>
      <SocialRingDisplay
        :value="ringMap"
        @change-ring="onRingChange"
        :respondents="ringRespondents"
        :ego="ego"
        :config="config"
      />
    </v-col>
  </v-col>
</template>

<style lang="sass">

</style>
