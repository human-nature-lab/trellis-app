<script setup lang="ts">
import { ref, computed } from 'vue'
import { debouncedAction } from '../../lib/action'
import Question from '@/entities/trellis/Question'
import PT from '@/static/parameter.types'
import { jsonQuestionParameter } from '@/lib/json-question-parameter'
import { ScaleConfig } from '@/components/builder/question-builders/ScaleBuilder.vue'
import Translated from '@/components/translation/Translated.vue'
import singleton from '@/static/singleton'
import { useTranslation, translate } from '@/helpers/translation.helper'
import { i18n } from '@/i18n'

const props = defineProps<{
  question: Question
  respondent: object
  location: object
}>()

const { config, loading: loadingConfig, error } = jsonQuestionParameter<ScaleConfig>(props.question)
const data = ref<Record<string, number>>({})

const questionTranslations = computed(() => {
  if (!config.value) return []
  return config.value.questions.map(q => useTranslation(q.translationId))
})

const choiceTranslations = computed(() => {
  if (!config.value) return []
  return config.value.choices.map(c => useTranslation(c.translationId))
})

const tickLabels = computed(() => {
  if (!config.value) return []
  const min = config.value.min || 0
  const max = config.value.max || config.value.choices.length
  const stepSize = config.value.stepSize || 1
  const d = max - min
  const numSteps = Math.floor(d / stepSize)

  const gapSize = Math.floor((d / stepSize) / (choiceTranslations.value.length - 1))
  const res: (string|null)[] = []
  // interpolate labels and add nulls for missing labels
  for (let i = 0; i <= numSteps; i++) {
    if ((i % gapSize) === 0) {
      const t = choiceTranslations.value[Math.floor(i / gapSize)]
      res.push(t.loading.value ? i18n.t('loading') as string : translate(t.translation.value, singleton.locale.id))
    } else {
      res.push(null)
    }
  }
  return res
})

</script>

<template>
  <div v-if="config">
    <v-list v-if="config.slider">
      <v-list-item
        v-for="q, index in config.questions"
        :key="q.value"
      >
        <v-list-item-title>
          <v-slider
            v-model="data[q.value]"
            :min="config.min || 1"
            :max="config.max || config.choices.length"
            :step="1"
            :loading="questionTranslations[index].loading.value"
            :tick-labels="tickLabels"
            :label="translate(questionTranslations[index].translation.value, singleton.locale.id)"
          />
        </v-list-item-title>
      </v-list-item>
    </v-list>
    <v-simple-table v-else>
      <thead>
        <tr>
          <th />
          <th
            v-for="choice, index in config.choices"
            :key="index"
          >
            <Translated
              :translation-id="choice.translationId"
              :locale="singleton.locale"
            />
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="q in config.questions"
          :key="q.value"
        >
          <td>
            <Translated
              :translation-id="q.translationId"
              :locale="singleton.locale"
            />
          </td>
          <td
            v-for="choice, index in config.choices"
            :key="index"
          >
            <v-radio
              :name="''+index"
              @change="data[index] = (data[q.value] === index) ? null : index"
              :value="!!data[q.value]"
            />
          </td>
        </tr>
      </tbody>
    </v-simple-table>
  </div>
</template>

<style lang="sass">
  table
    table-layout: fixed
</style>
