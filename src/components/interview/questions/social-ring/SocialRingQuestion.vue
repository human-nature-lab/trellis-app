<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import RespondentService from '@/services/respondent'
import EdgeService from '@/services/edge'
import RespondentServiceInterface from '@/services/respondent/RespondentServiceInterface'
import Question from '@/entities/trellis/Question'
import { jsonQuestionParameter } from '@/lib/json-question-parameter'
import { SocialRingConfig } from './SocialRingDisplay.vue'
import Respondent from '@/entities/trellis/Respondent'
import { logError } from '@/helpers/log.helper'
import { useDataStore } from '@/helpers/interview.helper'

const rs: RespondentServiceInterface = RespondentService
const props = defineProps<{
  question: Question
  respondent: Respondent
  location: object
}>()

const { config, loading: loadingConfig, error } = jsonQuestionParameter<SocialRingConfig>(props.question)
const loadingRespondents = ref(true)
const respondents = ref<Respondent[]>([])

watch(config, async () => {
  if (!config.value) return
  try {
    const qds = useDataStore().getQuestionDataByQuestionId(config.value.sourceQuestionId)
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
  } catch (err) {
    logError(err)
  } finally {
    loadingRespondents.value = false
  }
}, { immediate: true })

const loading = computed(() => loadingConfig.value || loadingRespondents.value)
</script>

<template>
  <v-col>
    <v-progress-linear
      v-if="loading"
      indeterminate
    />
    Social Ring Question
  </v-col>
</template>

<style lang="sass">

</style>
