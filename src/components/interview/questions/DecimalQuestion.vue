<script lang="ts" setup>
import { ref, computed } from 'vue'
import AT from '@/static/action.types'
import { debouncedAction } from '../lib/action'
import { useVuetifyQuestionRules, useQuestionDisabled } from '@/helpers/interview.helper'
import Question from '@/entities/trellis/Question'
import Respondent from '@/entities/trellis/Respondent'
import { useNumberParams } from '../hooks/useNumberParams'
import QuestionText from '../QuestionText.vue'

const props = defineProps<{
  question: Question
  disabled?: boolean
  respondent: Respondent
  location: Location
}>()

const { stepSize, min, max, isSlider, translatedLabels, initialValue } = useNumberParams(computed(() => props.question), 0.1)

const localVal = ref<number | null>(initialValue.value || null)
const value = computed(() => {
  return props.question.datum.data.length ? props.question.datum.data[0].val : localVal.value
})

function setValue (val: string | number) {
  localVal.value = +val
  props.question.isAnswered = value.value !== null && value.value !== undefined
  debouncedAction(props.question.id, AT.number_change, {
    name: 'decimal',
    val: '' + val,
  })
}

const rules = useVuetifyQuestionRules(props)
const isQuestionDisabled = useQuestionDisabled(props)

</script>

<template>
  <v-flex class="decimal-question">
    <QuestionText :question="question" />
    <v-slider
      v-if="isSlider"
      class="mt-6"
      :rules="rules"
      :disabled="isQuestionDisabled"
      :value="+value"
      :step="stepSize"
      :min="min"
      :max="max"
      :tick-labels="translatedLabels"
      thumb-label="always"
      @input="setValue"
    />
    <v-text-field
      v-else
      :rules="rules"
      :disabled="isQuestionDisabled"
      :value="+value"
      :step="stepSize"
      :min="min"
      :max="max"
      @input="setValue"
      :placeholder="$t('value')"
      type="number"
    />
  </v-flex>
</template>
