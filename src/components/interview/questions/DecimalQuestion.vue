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

const localVal = ref<number | null>(null)
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
const stepSize = computed(() => {
  const qp = props.question.questionParameters.find(qp => +qp.parameterId === PT.step_size)
  return qp ? +qp.val : 1
})

const min = computed(() => {
  const qp = props.question.questionParameters.find(qp => +qp.parameterId === PT.min)
  return qp ? +qp.val : null
})

const max = computed(() => {
  const qp = props.question.questionParameters.find(qp => +qp.parameterId === PT.max)
  return qp ? +qp.val : null
})

</script>

<template>
  <v-flex class="decimal-question">
    <v-text-field
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
