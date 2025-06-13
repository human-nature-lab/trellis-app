<script setup lang="ts">
import { computed, ref } from 'vue'
import { lookupQuestionType } from '@/static/question.types'
import ParameterTypes from '@/static/parameter.types'
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

const { form, data, loading, error } = useSurveyData(() => props.survey)

type Row = {
  varName: string
  type: string
  questionId: string
  index: number
  translation: Translation
  response?: any
  answer?: any
  isCorrect: boolean
}

const limitToAnswers = ref(false)

const rows = computed(() => {
  if (!form.value) return []
  const r = []
  let index = 0
  for (const section of form.value.sections) {
    for (const page of section.questionGroups) {
      for (const question of page.questions) {
        const row = {
          varName: question.varName,
          type: lookupQuestionType(question.questionTypeId),
          translation: question.questionTranslation,
          index: index++,
          questionId: question.id,
        } as Row
        const questionData = data.value.data.filter(d => d.questionId === question.id)
        if (questionData.length === 1) {
          const responses = questionData[0].data.map(d => d.val)
          responses.sort()
          row.response = responses.join(', ')
        }
        const correct = question.questionParameters?.filter(p => (+p.parameterId) === ParameterTypes.correct_choice)
        if (correct && correct.length) {
          const answers = correct.map(c => c.val)
          answers.sort()
          row.answer = answers.join(', ')
          row.isCorrect = row.response === row.answer
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
    form: TranslationService.getTranslated(form.value.nameTranslation as Translation, singleton.locale),
    respondent: respondentName,
  })
})

const visibleRows = computed(() => {
  if (!limitToAnswers.value) return rows.value
  return rows.value.filter(r => r.answer)
})

const correctCount = computed(() => rows.value.reduce((c, r) => r.isCorrect ? c + 1 : c, 0))
const numRowsWithAnswer = computed(() => rows.value.reduce((c, r) => r.answer ? c + 1 : c, 0))

const hasSectionConditionTags = computed(() => data.value && data.value.conditionTags && !!data.value.conditionTags.section.length)
const hasSurveyConditionTags = computed(() => data.value && data.value.conditionTags && !!data.value.conditionTags.survey.length)
const hasRespondentConditionTags = computed(() => data.value && data.value.conditionTags && !!data.value.conditionTags.respondent.length)

const hasConditionTags = computed(() => hasSectionConditionTags.value || hasSurveyConditionTags.value || hasRespondentConditionTags.value)
</script>

<template>
  <v-card flat>
    <v-card-title>
      {{ title }}
    </v-card-title>
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
      <v-row
        v-if="numRowsWithAnswer > 0"
        class="justify-space-betwee align-center"
        no-gutters
      >
        <v-col>
          <h3>
            {{ $t('survey_report_score', { correct: correctCount, total: numRowsWithAnswer }) }}
          </h3>
        </v-col>
        <v-checkbox
          v-model="limitToAnswers"
          :label="$t('only_show_answers')"
        />
      </v-row>
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
              {{ $t('answer') }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="row in visibleRows"
            :key="row.index"
          >
            <td>{{ row.varName }}</td>
            <td>{{ row.type }}</td>
            <td :class="{ 'success': row.isCorrect }">
              {{ row.response }}
            </td>
            <td>{{ row.answer }}</td>
          </tr>
        </tbody>
      </v-simple-table>
      <v-col
        v-if="hasConditionTags"
        class="mt-8"
      >
        <h2>{{ $t('condition_tags') }}</h2>
        <v-col v-if="hasSectionConditionTags">
          <h4>{{ $t('section') }}</h4>
          <v-row no-gutters>
            <v-chip
              v-for="ct in data.conditionTags.section"
              :key="ct.id"
            >
              {{ ct.conditionTag.name }}
            </v-chip>
          </v-row>
        </v-col>
        <v-col v-if="hasSurveyConditionTags">
          <h4>{{ $t('form') }}</h4>
          <v-row no-gutters>
            <v-chip
              v-for="ct in data.conditionTags.survey"
              :key="ct.id"
            >
              {{ ct.conditionTag.name }}
            </v-chip>
          </v-row>
        </v-col>
        <v-col v-if="hasRespondentConditionTags">
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
      </v-col>
    </v-card-text>
  </v-card>
</template>

<style lang="sass">

</style>
