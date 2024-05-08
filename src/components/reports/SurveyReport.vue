<script setup lang="ts">
import { computed } from 'vue'
import QT from '@/static/question.types'
import Respondent from '@/entities/trellis/Respondent'
import Survey from '@/entities/trellis/Survey'
import Translation from '@/entities/trellis/Translation'
import { useSurveyData } from '@/helpers/survey.helper'
import { i18n } from '@/i18n'
import TranslationService from '@/services/TranslationService'
import singleton from '@/static/singleton'

const props = defineProps<{
  respondent: Respondent
  survey: Survey
}>()

const { form, interview, data, loading, error } = useSurveyData(() => props.survey)

type Row = {
  varName: string
  type: string
  questionId: string
  index: number
  translation: Translation
  response?: any
  correct: boolean
}

const rows = computed(() => {
  if (!form.value) return []
  const r = []
  let index = 0
  for (const section of form.value.sections) {
    for (const page of section.questionGroups) {
      for (const question of page.questions) {
        const row = {
          varName: question.varName,
          type: QT[question.questionTypeId],
          translation: question.questionTranslation,
          index: index++,
          questionId: question.id,
        } as Row
        const questionData = data.value.data.filter(d => d.questionId === question.id)
        if (questionData.length === 1) {
          row.response = questionData[0].data.map(d => d.val).join(', ')
        }
        r.push(row)
      }
    }
  }
  return r
})

const title = computed(() => {
  if (!form.value) return i18n.t('loading')
  const respondentName = props.respondent.names.find(n => n.isDisplayName)?.name || props.respondent.name
  return i18n.t('survey_report_title', {
    form: TranslationService.getTranslated(form.value.nameTranslation, singleton.locale),
    respondent: respondentName,
  })
})

</script>

<template>
  <v-card>
    <v-card-title>{{ title }}</v-card-title>
    <v-alert
      v-if="error"
      color="error"
    >
      {{ error }}
    </v-alert>
    <v-progress-linear
      v-if="loading"
      indeterminate
    />
    <v-card-text v-else>
      <v-simple-table>
        <thead>
          <tr>
            <th>
              {{ $t('var_name') }}
            </th>
            <th>
              {{ $t('type') }}
            </th>
            <th>
              {{ $t('response') }}
            </th>
            <th>
              {{ $t('correct') }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="row in rows"
            :key="row.index"
          >
            <td>{{ row.varName }}</td>
            <td>{{ row.type }}</td>
            <td>{{ row.response }}</td>
            <td>{{ row.correct }}</td>
          </tr>
        </tbody>
      </v-simple-table>
      <v-col v-if="data && data.conditionTags">
        <h2>{{ $t('condition_tags') }}</h2>
        <h4>{{ $t('section') }}</h4>
        <v-row no-gutters>
          <v-chip
            v-for="ct in data.conditionTags.section"
            :key="ct.id"
          >
            {{ ct.conditionTag.name }}
          </v-chip>
        </v-row>
        <h4>{{ $t('form') }}</h4>
        <v-row no-gutters>
          <v-chip
            v-for="ct in data.conditionTags.survey"
            :key="ct.id"
          >
            {{ ct.conditionTag.name }}
          </v-chip>
        </v-row>
        <h4>{{ $t('respondent') }}</h4>
        <v-row no-gutters>
          <v-chip
            v-for="ct in data.conditionTags.respondent"
            :key="ct.id"
          >
            {{ ct.conditionTag.name }}
          </v-chip>
        </v-row>
      </v-col>
    </v-card-text>
  </v-card>
</template>

<style lang="sass">

</style>
