<script lang="ts" setup>
import { ref, computed } from 'vue'
import AT from '@/static/action.types'
import PT from '@/static/parameter.types'
import { debouncedAction } from '../lib/action'
import { useVuetifyQuestionRules, useQuestionDisabled } from '@/helpers/interview.helper'
import Question from '@/entities/trellis/Question'
import Respondent from '@/entities/trellis/Respondent'
import { translate, useTranslations } from '@/helpers/translation.helper'
import { i18n } from '@/i18n'
import singleton from '@/static/singleton'
import Translation from '@/entities/trellis/Translation'

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

const tickLabels = computed(() => {
  if (!isSlider.value) return []
  const qp = props.question.questionParameters.find(qp => +qp.parameterId === PT.tick_labels)
  const d = max.value - min.value
  const numSteps = Math.floor(d / stepSize.value)
  if (qp) {
    const labels = JSON.parse(qp.val)
    if (labels.length === 0) return []
    if (labels.length === numSteps) {
      return labels
    }
    const res = []
    const gapSize = Math.floor((d / stepSize.value) / (labels.length - 1))
    // interpolate labels and add nulls for missing labels
    for (let i = 0; i <= numSteps; i++) {
      if (i % (gapSize) === 0) {
        res.push(labels[i / (gapSize)])
      } else {
        res.push(null)
      }
    }
    return res
  }
  const labels = []

  const tickSize = d <= 10 ? 1 : Math.round(d / 10)
  for (let i = min.value; i <= max.value; i++) {
    labels.push((i === min.value || i % tickSize === 0) ? ('' + i) : null)
  }
  return labels
})

const { translations, loading } = useTranslations(computed(() =>
  tickLabels.value.filter(t => !!t).map(t => t.translationId),
))
const translationMap = computed(() => {
  const map: Record<string, Translation> = {}
  translations.value.forEach(t => {
    if (!t) return
    map[t.id] = t as Translation
  })
  return map
})

const translatedLabels = computed(() => {
  return tickLabels.value.map(t => {
    if (!t) return null
    if (loading.value) return i18n.t('loading') as string
    return translate(translationMap.value[t.translationId], singleton.locale.id)
  })
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
