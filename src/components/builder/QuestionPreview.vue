<script setup lang="ts">
import { computed, provide, ref, watch } from 'vue'
import Interview from '@/entities/trellis/Interview'
import QuestionModel from '@/entities/trellis/Question'
import Question from '../interview/Question.vue'
import { InterviewLocation } from '../interview/services/InterviewAlligator'
import InterviewManager from '../interview/classes/InterviewManager'
import Form from '@/entities/trellis/Form'
import { logError } from '@/helpers/log.helper'
import { manager as managerSymbol } from '@/symbols/interview'
import QuestionDatum from '@/entities/trellis/QuestionDatum'
import { useActionHandler } from '../interview/lib/action'

const props = defineProps<{
  question: QuestionModel
  form: Form
  location?: InterviewLocation
}>()

const interview = ref<Interview>()
const manager = ref<InterviewManager>()
provide(managerSymbol, manager)
const disabled = ref(false)
const loading = ref(true)
const question = ref<QuestionModel>()

useActionHandler(async action => {
  if (!manager.value) return
  await manager.value.pushAction(action)
  // question.value = question.value ? question.value.copy() : null
  question.value.datum = manager.value.data.getQuestionDatumById(question.value.datum.id)
  question.value.datum = question.value && question.value.datum ? question.value.datum.copy() : null
})

async function load () {
  try {
    loading.value = true
    interview.value = new Interview().fromSnakeJSON({
      id: 'Preview ID',
      survey: {
        id: 'Preview survey id',
        respondent_id: 'Preview respondent id',
      },
    })
    manager.value = new InterviewManager(interview.value, props.form)
    await manager.value.initialize()
    question.value = props.question.copy()
    const qd = new QuestionDatum().fromSnakeJSON({
      id: 'Preview QuestionDatum ID',
      question_id: props.question.id,
      survey_id: interview.value.survey.id,
      data: [],
      dk_rf: null,
    })
    qd.createdAt = new Date()
    qd.updatedAt = new Date()
    qd.followUpDatumId = null
    qd.sectionRepetition = 0
    manager.value.data.add(qd)
    question.value.datum = qd.copy()
    loading.value = false
  } catch (err) {
    logError(err)
  }
}

watch(() => props.question, load, { immediate: true, deep: true })

</script>

<template>
  <v-col>
    <v-progress-linear
      v-if="loading"
      indeterminate
    />
    <Question
      v-else
      :question="question"
      :location="manager.location"
      :disabled="disabled"
      :interview="interview"
    />
  </v-col>
</template>

<style lang="sass">

</style>
