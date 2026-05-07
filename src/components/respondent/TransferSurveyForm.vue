<script setup lang="ts">
import { ref, computed } from 'vue'
import { useSurvey } from '@/helpers/survey.helper'
import { locale } from '@/helpers/singleton.helper'
import { useRespondent } from '@/helpers/respondent.helper'
import SurveyService from '@/services/survey'
import Translated from '../translation/Translated.vue'
import RespondentSelector from './RespondentSelector.vue'
import RespondentName from './RespondentName.vue'

const props = defineProps<{
  surveyId: string;
}>()

const emit = defineEmits<{
  (e: 'success'): void;
  (e: 'error', message: string): void;
}>()

const { survey, loading: surveyLoading, error: surveyError } = useSurvey(() => props.surveyId)
const newRespondentId = ref<string>()

const {
  respondent: fromRespondent,
  loading: fromRespondentLoading,
  error: fromRespondentError,
} = useRespondent(() => survey.value?.respondentId)

const transferWorking = ref(false)
const {
  respondent: newRespondent,
  loading: newRespondentLoading,
  error: newRespondentError,
} = useRespondent(newRespondentId)

const transferSurvey = async () => {
  if (transferWorking.value) return
  transferWorking.value = true
  try {
    const result = await SurveyService.transfer(props.surveyId, newRespondentId.value)
    if (result.success) {
      emit('success')
    } else {
      emit('error', result.message)
    }
  } catch (error) {
    emit('error', error.message)
  } finally {
    transferWorking.value = false
  }
}

const loading = computed(() => {
  return fromRespondentLoading.value || newRespondentLoading.value || surveyLoading.value || transferWorking.value
})
const error = computed(() => {
  return fromRespondentError.value || newRespondentError.value || surveyError.value
})
</script>

<template>
  <div>
    <v-progress-linear
      v-if="loading"
      indeterminate
    />
    <v-alert
      v-if="error"
      type="error"
    >
      {{ error }}
    </v-alert>
    <v-form v-if="survey">
      <h2>
        {{ $t('from_respondent') }} : 
        <RespondentName
          :respondent="fromRespondent"
          show-link
        />
      </h2>
      <h3 v-if="survey.form">
        {{ $t('survey') }} : <Translated
          :translation="survey.form.nameTranslation"
          :locale="locale"
        />
      </h3>
      <h3>
        {{ $t('to_respondent') }} : <RespondentName
          :respondent="newRespondent"
          show-link
        />
        <RespondentSelector
          v-model="newRespondentId"
        />
      </h3>
      <v-btn
        :disabled="loading || !newRespondentId"
        @click="transferSurvey"
      >
        {{ $t('submit') }}
      </v-btn>
    </v-form>
  </div>
</template>
