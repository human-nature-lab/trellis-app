<script lang="ts" setup>
import { ref, computed } from 'vue'
import AT from '@/static/action.types'
import PT from '@/static/parameter.types'
import { debouncedAction } from '../lib/action'
import { useVuetifyQuestionRules, useQuestionDisabled } from '@/helpers/interview.helper'
import Question from '@/entities/trellis/Question'
import Respondent from '@/entities/trellis/Respondent'

const props = defineProps<{
  question: Question
  disabled?: boolean
  respondent: Respondent
  location: Location
}>()

const isSlider = computed(() => {
  const qp = props.question.questionParameters.find(qp => +qp.parameterId === PT.display_slider)
  return qp ? !!+qp.val : false
})

const min = computed(() => {
  const qp = props.question.questionParameters.find(qp => +qp.parameterId === PT.min)
  if (qp) {
    return +qp.val
  } else if (isSlider.value) {
    return 0
  } else {
    return null
  }
})

const max = computed(() => {
  const qp = props.question.questionParameters.find(qp => +qp.parameterId === PT.max)
  if (qp) {
    return +qp.val
  } else if (isSlider.value) {
    return 100
  } else {
    return null
  }
})

const stepSize = computed(() => {
  const qp = props.question.questionParameters.find(qp => +qp.parameterId === PT.step_size)
  return qp ? +qp.val : 0.1
})

const initialValue = computed(() => {
  const qp = props.question.questionParameters.find(qp => +qp.parameterId === PT.initial_value)
  if (qp) {
    return +qp.val
  } else if (isSlider.value) {
    const midpoint = (max.value - min.value) / 2
    // round to nearest step size
    return Math.round(midpoint / stepSize.value) * stepSize.value
  } else {
    return null
  }
})

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
    <v-slider
      v-if="isSlider"
      class="mt-6"
      :rules="rules"
      :disabled="isQuestionDisabled"
      :value="+value"
      :step="stepSize"
      :min="min"
      :max="max"
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
